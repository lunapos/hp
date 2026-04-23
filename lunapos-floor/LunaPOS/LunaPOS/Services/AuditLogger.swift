import Foundation
import OSLog

private let logger = Logger(subsystem: "com.luna.pos", category: "AuditLogger")

/// 操作ログ記録（3.3.2）
/// UIをブロックしないよう非同期で送信、失敗時はローカルに蓄積して後で再送
@Observable
final class AuditLogger: @unchecked Sendable {
    static let shared = AuditLogger()

    /// ローカルキュー（送信失敗時の蓄積用）
    private var pendingLogs: [AuditLogEntry] = []
    private let maxPendingLogs = 100
    private let userDefaultsKey = "luna_audit_pending_logs"

    private init() {
        loadPendingLogs()
    }

    // MARK: - 操作種別

    enum Action: String, Sendable {
        case create
        case update
        case delete
        case checkout
        case cancel
        case discount
        case priceOverride = "price_override"
        case clockIn = "clock_in"
        case clockOut = "clock_out"
        case settingsChange = "settings_change"
    }

    // MARK: - ログエントリ

    struct AuditLogEntry: Codable, Sendable {
        let tenantId: String
        let userId: String?
        let action: String
        let targetTable: String
        let targetId: String?
        let oldValue: [String: String]?
        let newValue: [String: String]?
        let createdAt: Date
    }

    // MARK: - ログ記録

    /// 操作ログを非同期で記録（UIをブロックしない）
    func log(
        action: Action,
        targetTable: String,
        targetId: String? = nil,
        oldValue: [String: String]? = nil,
        newValue: [String: String]? = nil
    ) {
        guard let tenantId = SupabaseService.shared.tenantId?.uuidString else {
            logger.warning("テナントID未設定のためログ記録をスキップ")
            return
        }

        let entry = AuditLogEntry(
            tenantId: tenantId,
            userId: nil, // 端末認証のためユーザーIDは端末名
            action: action.rawValue,
            targetTable: targetTable,
            targetId: targetId,
            oldValue: oldValue,
            newValue: newValue,
            createdAt: Date()
        )

        Task {
            await sendLog(entry)
        }
    }

    /// ログをSupabaseに送信
    private func sendLog(_ entry: AuditLogEntry) async {
        do {
            let row: [String: String?] = [
                "tenant_id": entry.tenantId,
                "user_id": entry.userId,
                "action": entry.action,
                "target_table": entry.targetTable,
                "target_id": entry.targetId,
            ]

            try await SupabaseService.shared.client
                .from("audit_logs")
                .insert(row)
                .execute()

            logger.info("操作ログ送信: \(entry.action) on \(entry.targetTable)")
        } catch {
            logger.warning("操作ログ送信失敗、ローカルに蓄積: \(error.localizedDescription)")
            addToPending(entry)
        }
    }

    // MARK: - ローカルキュー管理

    private func addToPending(_ entry: AuditLogEntry) {
        pendingLogs.append(entry)
        if pendingLogs.count > maxPendingLogs {
            pendingLogs.removeFirst(pendingLogs.count - maxPendingLogs)
        }
        savePendingLogs()
    }

    /// 蓄積されたログを再送
    func retryPending() async {
        let logs = pendingLogs
        pendingLogs = []
        savePendingLogs()

        for entry in logs {
            await sendLog(entry)
        }
    }

    private func savePendingLogs() {
        if let data = try? JSONEncoder().encode(pendingLogs) {
            UserDefaults.standard.set(data, forKey: userDefaultsKey)
        }
    }

    private func loadPendingLogs() {
        if let data = UserDefaults.standard.data(forKey: userDefaultsKey),
           let logs = try? JSONDecoder().decode([AuditLogEntry].self, from: data) {
            pendingLogs = logs
        }
    }

    var pendingCount: Int { pendingLogs.count }
}

/// マネージャーPIN認証（3.3.3）
@Observable
final class ManagerAuth: @unchecked Sendable {
    static let shared = ManagerAuth()

    /// PINコード（店舗設定から取得、nil=認証不要）
    var pin: String? {
        get { UserDefaults.standard.string(forKey: "luna_manager_pin") }
        set { UserDefaults.standard.set(newValue, forKey: "luna_manager_pin") }
    }

    /// 連続失敗回数
    private(set) var failedAttempts = 0

    /// ロックアウト中かどうか
    private(set) var isLockedOut = false
    private var lockoutEndTime: Date?

    private init() {}

    /// PIN認証を実行
    func authenticate(input: String) -> Bool {
        guard let correctPin = pin else { return true } // PIN未設定=認証不要

        // ロックアウトチェック
        if let lockEnd = lockoutEndTime, Date() < lockEnd {
            isLockedOut = true
            return false
        } else {
            isLockedOut = false
        }

        if input == correctPin {
            failedAttempts = 0
            return true
        } else {
            failedAttempts += 1
            if failedAttempts >= 3 {
                lockoutEndTime = Date().addingTimeInterval(300) // 5分ロックアウト
                isLockedOut = true
            }
            return false
        }
    }

    /// PIN認証が必要かどうか
    var isRequired: Bool { pin != nil }
}
