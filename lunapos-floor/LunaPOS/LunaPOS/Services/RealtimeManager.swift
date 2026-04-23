import Foundation
import Supabase
import OSLog

private let logger = Logger(subsystem: "com.luna.pos", category: "RealtimeManager")

/// Realtime接続状態（2.1.1）
enum RealtimeConnectionState: String, Sendable {
    case disconnected
    case connecting
    case connected
    case reconnecting
}

/// Realtime同期マネージャー（2.1.1）
/// Supabase Realtimeチャンネルの接続・切断・再接続を管理
@Observable
final class RealtimeManager: @unchecked Sendable {
    private let supabase = SupabaseService.shared

    /// 接続状態（2.1.1）
    private(set) var connectionState: RealtimeConnectionState = .disconnected

    /// 再接続試行回数
    private var reconnectAttempt = 0
    private let maxReconnectAttempts = 5

    /// テーブルロック管理（2.1.4）
    private var lockedTables: [String: Date] = [:]
    private let lockTimeout: TimeInterval = 60 // 60秒でタイムアウト

    /// コールバック
    var onCastShiftChanged: ((String, Bool) -> Void)? // castId, isClockIn
    var onTableStatusChanged: ((String, String) -> Void)? // tableId, newStatus
    var onVisitChanged: ((String) -> Void)? // visitId

    init() {}

    // MARK: - 接続管理（2.1.1）

    /// Realtimeチャンネルを開始
    func connect() async {
        guard let tenantId = supabase.tenantId else {
            logger.warning("テナントID未設定のためRealtime接続をスキップ")
            return
        }

        connectionState = .connecting
        logger.info("Realtime接続開始 tenant_id=\(tenantId)")

        // チャンネル作成（テナントIDでフィルタ）（2.1.1）
        let channel = supabase.client.realtimeV2.channel("tenant-\(tenantId.uuidString)")

        // 2.1.2 キャスト出退勤の購読
        let castShiftChanges = channel.postgresChange(
            InsertAction.self,
            schema: "public",
            table: "cast_shifts"
        )

        let castShiftUpdates = channel.postgresChange(
            UpdateAction.self,
            schema: "public",
            table: "cast_shifts"
        )

        // 2.1.3 テーブルステータスの購読
        let tableUpdates = channel.postgresChange(
            UpdateAction.self,
            schema: "public",
            table: "floor_tables"
        )

        // 2.1.3 来店データの購読
        let visitInserts = channel.postgresChange(
            InsertAction.self,
            schema: "public",
            table: "visits"
        )

        let visitUpdates = channel.postgresChange(
            UpdateAction.self,
            schema: "public",
            table: "visits"
        )

        // 変更をリッスン
        Task {
            for await change in castShiftChanges {
                handleCastShiftChange(change)
            }
        }
        Task {
            for await change in castShiftUpdates {
                handleCastShiftUpdate(change)
            }
        }
        Task {
            for await change in tableUpdates {
                handleTableUpdate(change)
            }
        }
        Task {
            for await change in visitInserts {
                handleVisitInsert(change)
            }
        }
        Task {
            for await change in visitUpdates {
                handleVisitUpdate(change)
            }
        }

        // チャンネル購読開始
        await channel.subscribe()

        connectionState = .connected
        reconnectAttempt = 0
        logger.info("Realtime接続完了")
    }

    /// 切断時の再接続（指数バックオフ、最大5回）（2.1.1）
    func handleDisconnection() async {
        guard reconnectAttempt < maxReconnectAttempts else {
            logger.error("再接続最大回数に到達。手動再接続が必要")
            connectionState = .disconnected
            return
        }

        connectionState = .reconnecting
        reconnectAttempt += 1
        let delay = pow(2.0, Double(reconnectAttempt)) // 2, 4, 8, 16, 32秒
        logger.warning("Realtime再接続 \(self.reconnectAttempt)/\(self.maxReconnectAttempts) — \(delay)秒後")

        try? await Task.sleep(for: .seconds(delay))
        await connect()
    }

    // MARK: - イベントハンドラ（2.1.2, 2.1.3）

    private func handleCastShiftChange(_ action: InsertAction) {
        logger.info("キャスト出勤検知（INSERT）")
        if let castId = action.record["cast_id"]?.stringValue {
            DispatchQueue.main.async { [weak self] in
                self?.onCastShiftChanged?(castId, true)
            }
        }
    }

    private func handleCastShiftUpdate(_ action: UpdateAction) {
        logger.info("キャストシフト更新検知（UPDATE）")
        if let castId = action.record["cast_id"]?.stringValue {
            let hasClockOut = action.record["clock_out"]?.stringValue != nil
            DispatchQueue.main.async { [weak self] in
                self?.onCastShiftChanged?(castId, !hasClockOut)
            }
        }
    }

    private func handleTableUpdate(_ action: UpdateAction) {
        logger.info("テーブルステータス変更検知")
        if let tableId = action.record["id"]?.stringValue,
           let status = action.record["status"]?.stringValue {
            DispatchQueue.main.async { [weak self] in
                self?.onTableStatusChanged?(tableId, status)
            }
        }
    }

    private func handleVisitInsert(_ action: InsertAction) {
        logger.info("来店データ挿入検知")
        if let visitId = action.record["id"]?.stringValue {
            DispatchQueue.main.async { [weak self] in
                self?.onVisitChanged?(visitId)
            }
        }
    }

    private func handleVisitUpdate(_ action: UpdateAction) {
        logger.info("来店データ更新検知")
        if let visitId = action.record["id"]?.stringValue {
            DispatchQueue.main.async { [weak self] in
                self?.onVisitChanged?(visitId)
            }
        }
    }

    // MARK: - テーブルロック機構（2.1.4）

    /// テーブルのロックを取得
    func acquireLock(tableId: String) -> Bool {
        cleanupExpiredLocks()

        if let existingLock = lockedTables[tableId] {
            // 既にロック中
            logger.warning("テーブルロック競合: \(tableId) — 他のスタッフが操作中")
            return false
        }

        lockedTables[tableId] = Date()
        logger.info("テーブルロック取得: \(tableId)")
        return true
    }

    /// テーブルのロックを解放
    func releaseLock(tableId: String) {
        lockedTables.removeValue(forKey: tableId)
        logger.info("テーブルロック解放: \(tableId)")
    }

    /// 期限切れのロックを自動解放（60秒タイムアウト）（2.1.4）
    private func cleanupExpiredLocks() {
        let now = Date()
        lockedTables = lockedTables.filter { _, lockTime in
            now.timeIntervalSince(lockTime) < lockTimeout
        }
    }

    /// テーブルがロック中かどうか
    func isLocked(tableId: String) -> Bool {
        cleanupExpiredLocks()
        return lockedTables[tableId] != nil
    }
}

// MARK: - AnyJSON拡張

private extension AnyJSON {
    var stringValue: String? {
        switch self {
        case .string(let s): return s
        default: return nil
        }
    }
}
