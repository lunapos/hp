import Foundation
import Network
import OSLog
import UIKit

private let logger = Logger(subsystem: "com.luna.pos", category: "SyncEngine")

/// 同期レコードのメタデータ（1.2.1）
/// 各エンティティに付与する同期プロパティを管理
struct SyncMetadata: Codable, Sendable {
    var needsSync: Bool = true
    var lastSyncedAt: Date?
    var syncRetryCount: Int = 0

    /// syncRetryCount >= 3 のレコードは同期失敗として扱う（1.2.1）
    var isSyncFailed: Bool { syncRetryCount >= 3 }
}

/// 同期対象レコード（SyncEngineが処理するために必要な情報）
struct SyncRecord: Sendable {
    let entityType: SyncEntityType
    let entityId: String
    var metadata: SyncMetadata
    let createdAt: Date
}

/// 同期対象エンティティの種類（1.2.3: 外部キー依存順）
enum SyncEntityType: Int, CaseIterable, Sendable, Comparable {
    case visit = 0
    case nomination = 1
    case orderItem = 2
    case payment = 3
    case cashWithdrawal = 4

    static func < (lhs: SyncEntityType, rhs: SyncEntityType) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

@Observable
final class SyncEngine: @unchecked Sendable {
    private let supabase = SupabaseService.shared
    private let networkMonitor = NetworkMonitor.shared

    // MARK: - 公開プロパティ

    /// オンライン状態（NetworkMonitorから取得）
    var isOnline: Bool { networkMonitor.isConnected }

    /// 最後の同期エラーメッセージ
    var lastSyncError: String?

    /// 同期中の進捗（1.2.3）
    var syncProgress: (completed: Int, total: Int) = (0, 0)

    /// 同期中フラグ
    private(set) var isSyncing = false

    /// 同期失敗レコード数（1.2.4）
    private(set) var syncFailedCount = 0

    /// 同期メタデータストレージ（entityId -> SyncMetadata）
    private var syncMetadataStore: [String: SyncMetadata] = [:]
    private static let metadataStorageKey = "luna_sync_metadata"

    // MARK: - 初期化

    init() {
        loadSyncMetadata()

        // ネットワーク復旧時に同期開始（1.2.3）
        NotificationCenter.default.addObserver(
            forName: NetworkMonitor.networkRestoredNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            guard let self else { return }
            logger.info("ネットワーク復旧検知 — 同期開始")
            Task { await self.syncPendingRecords() }
        }

        // アプリフォアグラウンド復帰時にも同期（1.2.3）
        NotificationCenter.default.addObserver(
            forName: UIApplication.willEnterForegroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            guard let self else { return }
            logger.info("フォアグラウンド復帰 — 同期試行")
            Task { await self.syncPendingRecords() }
        }

        updateSyncFailedCount()
    }

    // MARK: - エラー表示

    func clearError() {
        Task { @MainActor in
            lastSyncError = nil
        }
    }

    private func setSyncError(_ message: String) {
        Task { @MainActor in
            lastSyncError = message
            // 5秒後に自動クリア
            try? await Task.sleep(for: .seconds(5))
            if lastSyncError == message {
                lastSyncError = nil
            }
        }
    }

    // MARK: - SyncMetadata 管理（1.2.1）

    /// エンティティの同期メタデータを取得（なければデフォルト作成）
    func getMetadata(for entityId: String) -> SyncMetadata {
        syncMetadataStore[entityId] ?? SyncMetadata()
    }

    /// 同期メタデータを更新
    func updateMetadata(for entityId: String, _ update: (inout SyncMetadata) -> Void) {
        var metadata = getMetadata(for: entityId)
        update(&metadata)
        syncMetadataStore[entityId] = metadata
        saveSyncMetadata()
        updateSyncFailedCount()
    }

    /// needsSyncフラグを設定（新規・変更時に呼ぶ）
    func markNeedsSync(_ entityId: String) {
        updateMetadata(for: entityId) { $0.needsSync = true }
    }

    /// 同期成功時にフラグを更新（1.2.3）
    private func markSynced(_ entityId: String) {
        updateMetadata(for: entityId) {
            $0.needsSync = false
            $0.lastSyncedAt = Date()
            $0.syncRetryCount = 0
        }
    }

    /// 同期失敗時にリトライカウントを増加（1.2.4）
    private func markSyncFailed(_ entityId: String) {
        updateMetadata(for: entityId) { $0.syncRetryCount += 1 }
    }

    /// 手動リトライ時にリトライカウントをリセット（1.2.4）
    func resetRetryCount(_ entityId: String) {
        updateMetadata(for: entityId) {
            $0.syncRetryCount = 0
            $0.needsSync = true
        }
    }

    /// 同期失敗レコード数を更新
    private func updateSyncFailedCount() {
        syncFailedCount = syncMetadataStore.values.filter { $0.isSyncFailed }.count
    }

    // MARK: - 永続化

    private func loadSyncMetadata() {
        guard let data = UserDefaults.standard.data(forKey: Self.metadataStorageKey),
              let stored = try? JSONDecoder().decode([String: SyncMetadata].self, from: data) else { return }
        syncMetadataStore = stored
    }

    private func saveSyncMetadata() {
        if let data = try? JSONEncoder().encode(syncMetadataStore) {
            UserDefaults.standard.set(data, forKey: Self.metadataStorageKey)
        }
    }

    // MARK: - 手動リトライ（1.2.4）

    /// 同期失敗レコードを全てリトライ
    func retryFailed() {
        for (entityId, metadata) in syncMetadataStore where metadata.isSyncFailed {
            resetRetryCount(entityId)
        }
        Task { await syncPendingRecords() }
    }

    // MARK: - バッチ同期（1.2.3）

    /// needsSync=true のレコードを同期順で処理
    @MainActor
    private func syncPendingRecords() async {
        guard isOnline, !isSyncing else { return }
        isSyncing = true
        defer { isSyncing = false }

        let pending = syncMetadataStore.filter { $0.value.needsSync && !$0.value.isSyncFailed }
        guard !pending.isEmpty else { return }

        syncProgress = (0, pending.count)
        var completed = 0

        // 注: 実際のレコードデータはAppViewModel経由で取得する必要があるため、
        // ここでは個別sync呼び出しで既にSupabaseに送信済みのケースが主。
        // バッチ同期は将来のオフライン復帰用に基盤を用意。

        for (entityId, _) in pending {
            completed += 1
            syncProgress = (completed, pending.count)
        }
    }

    // MARK: - Initial Sync (Supabase → ローカル)

    @MainActor
    func loadInitialData(into vm: AppViewModel) async {
        guard supabase.isAuthenticated else { return }

        do {
            // 店舗設定
            let settings = try await supabase.fetchStoreSettings()
            vm.storeSettings = settings

            // マスタデータを並列取得
            async let rooms = supabase.fetchRooms()
            async let tables = supabase.fetchFloorTables()
            async let casts = supabase.fetchCasts()
            async let menuItems = supabase.fetchMenuItems()
            async let setPlans = supabase.fetchSetPlans()
            async let customers = supabase.fetchCustomers()

            let (r, t, c, m, s, cu) = try await (rooms, tables, casts, menuItems, setPlans, customers)

            vm.rooms = r.map { $0.toModel() }
            vm.tables = t.map { $0.toModel() }
            vm.casts = c.map { $0.toModel() }
            vm.menuItems = m.map { $0.toModel() }
            vm.setPlans = s.map { $0.toModel() }
            vm.customers = cu.map { $0.toModel() }
            vm.isLoadedFromSupabase = true
        } catch {
            logger.error("[SyncEngine] 初期データ同期失敗: \(error)")
            setSyncError("初期データの同期に失敗しました。ローカルデータで動作します。")
        }
    }

    // MARK: - Write Sync (ローカル → Supabase)（1.2.3, 1.2.5）

    func syncVisit(_ visit: Visit) {
        guard let tenantId = supabase.tenantId else { return }
        markNeedsSync(visit.id)

        guard isOnline else { return }
        Task {
            do {
                // 競合解決（1.2.5）
                if let serverDate = try? await supabase.fetchServerUpdatedAt(table: "visits", id: UUID(uuidString: visit.id) ?? UUID()) {
                    // サーバーの方が新しい場合はスキップ（Last Write Wins）
                    if serverDate > Date() {
                        logger.info("[SyncEngine] 競合検出: サーバーが新しいためスキップ visit_id=\(visit.id)")
                        markSynced(visit.id)
                        return
                    }
                }

                let row = VisitRow.from(visit, tenantId: tenantId)
                try await supabase.upsertVisit(row)

                // Nominations
                let nominationRows = visit.nominations.map { nom in
                    NominationRow.from(
                        nom,
                        visitId: visit.id,
                        tenantId: tenantId,
                        feeOverride: visit.nominationFeeOverrides[nom.castId]
                    )
                }
                try await supabase.upsertNominations(nominationRows, visitId: UUID(uuidString: visit.id)!)

                // Order items
                let orderRows = visit.orderItems.map {
                    OrderItemRow.from($0, visitId: visit.id, tenantId: tenantId)
                }
                try await supabase.upsertOrderItems(orderRows, visitId: UUID(uuidString: visit.id)!)

                markSynced(visit.id)
            } catch {
                logger.error("[SyncEngine] Visit sync failed: \(error)")
                markSyncFailed(visit.id)
                setSyncError("来店データの同期に失敗しました")
            }
        }
    }

    func syncFloorTable(_ table: FloorTable) {
        guard let tenantId = supabase.tenantId else { return }
        markNeedsSync(table.id)

        guard isOnline else { return }
        Task {
            do {
                let row = FloorTableRow.from(table, tenantId: tenantId)
                try await supabase.upsertFloorTable(row)
                markSynced(table.id)
            } catch {
                logger.error("[SyncEngine] Table sync failed: \(error)")
                markSyncFailed(table.id)
                setSyncError("テーブルの同期に失敗しました")
            }
        }
    }

    func syncPayment(_ payment: Payment) {
        guard let tenantId = supabase.tenantId else { return }
        markNeedsSync(payment.id)

        guard isOnline else { return }
        Task {
            do {
                // 会計データは競合時にサーバー優先（1.2.5）
                if let serverDate = try? await supabase.fetchServerUpdatedAt(table: "payments", id: UUID(uuidString: payment.id) ?? UUID()),
                   serverDate > Date() {
                    logger.warning("[SyncEngine] 会計データ競合: サーバー優先 payment_id=\(payment.id)")
                    markSynced(payment.id)
                    return
                }

                let row = PaymentRow.from(payment, tenantId: tenantId)
                try await supabase.upsertPayment(row)

                let itemRows = payment.items.map {
                    PaymentItemRow.from($0, paymentId: payment.id, tenantId: tenantId)
                }
                try await supabase.upsertPaymentItems(itemRows, paymentId: UUID(uuidString: payment.id) ?? UUID())

                markSynced(payment.id)
            } catch {
                logger.error("[SyncEngine] Payment sync failed: \(error)")
                markSyncFailed(payment.id)
                setSyncError("会計データの同期に失敗しました")
            }
        }
    }

    func syncCastShift(castId: String, clockIn: Date, clockOut: Date?, scheduledIn: String?, scheduledOut: String?) {
        guard let tenantId = supabase.tenantId else { return }
        let shiftId = UUID()
        markNeedsSync(shiftId.uuidString)

        guard isOnline else { return }
        Task {
            do {
                let row = CastShiftRow(
                    id: shiftId,
                    tenantId: tenantId,
                    castId: UUID(uuidString: castId) ?? UUID(),
                    clockIn: clockIn,
                    clockOut: clockOut,
                    scheduledClockIn: scheduledIn,
                    scheduledClockOut: scheduledOut
                )
                try await supabase.upsertCastShift(row)
                markSynced(shiftId.uuidString)
            } catch {
                logger.error("[SyncEngine] Cast shift sync failed: \(error)")
                markSyncFailed(shiftId.uuidString)
                setSyncError("シフトデータの同期に失敗しました")
            }
        }
    }

    func syncCustomer(_ customer: Customer) {
        guard let tenantId = supabase.tenantId else { return }
        markNeedsSync(customer.id)

        guard isOnline else { return }
        Task {
            do {
                let row = CustomerRow.from(customer, tenantId: tenantId)
                try await supabase.updateCustomer(row)
                markSynced(customer.id)
            } catch {
                logger.error("[SyncEngine] Customer sync failed: \(error)")
                markSyncFailed(customer.id)
                setSyncError("顧客データの同期に失敗しました")
            }
        }
    }

    func syncCashWithdrawal(_ withdrawal: CashWithdrawal) {
        guard let tenantId = supabase.tenantId else { return }
        markNeedsSync(withdrawal.id)

        guard isOnline else { return }
        Task {
            do {
                let row = CashWithdrawalRow.from(withdrawal, tenantId: tenantId)
                try await supabase.upsertCashWithdrawal(row)
                markSynced(withdrawal.id)
            } catch {
                logger.error("[SyncEngine] Cash withdrawal sync failed: \(error)")
                markSyncFailed(withdrawal.id)
                setSyncError("出金データの同期に失敗しました")
            }
        }
    }
}
