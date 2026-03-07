import Foundation
import OSLog

private let logger = Logger(subsystem: "com.luna.pos", category: "FreemiumManager")

/// フリーミアム制御マネージャー（3.4）
/// 月500会計まで無料、超過時は新規会計をブロック
@Observable
final class FreemiumManager: @unchecked Sendable {
    static let shared = FreemiumManager()

    /// 月間会計数の上限
    let monthlyLimit = 500

    /// 警告を表示する閾値（残り50件で警告）
    let warningThreshold = 450

    /// 今月の会計数（キャッシュ）
    private(set) var currentMonthCount = 0

    /// 最終更新日時
    private(set) var lastUpdated: Date?

    /// 有料プランかどうか（将来的にStripe連携）
    var isPaidPlan: Bool {
        get { UserDefaults.standard.bool(forKey: "luna_is_paid_plan") }
        set { UserDefaults.standard.set(newValue, forKey: "luna_is_paid_plan") }
    }

    private init() {}

    // MARK: - 状態チェック

    /// 会計可能かどうか
    var canCheckout: Bool {
        isPaidPlan || currentMonthCount < monthlyLimit
    }

    /// 警告を表示すべきかどうか
    var shouldShowWarning: Bool {
        !isPaidPlan && currentMonthCount >= warningThreshold && currentMonthCount < monthlyLimit
    }

    /// 上限に達したかどうか
    var isLimitReached: Bool {
        !isPaidPlan && currentMonthCount >= monthlyLimit
    }

    /// 残り会計数
    var remainingCount: Int {
        max(0, monthlyLimit - currentMonthCount)
    }

    /// 進捗テキスト（例: "423 / 500"）
    var progressText: String {
        "\(currentMonthCount) / \(monthlyLimit)"
    }

    // MARK: - カウント管理

    /// 会計完了時にインクリメント
    func incrementCount() {
        currentMonthCount += 1
        saveCache()
        logger.info("月間会計数: \(self.currentMonthCount)/\(self.monthlyLimit)")
    }

    /// Supabaseから今月の会計数を取得
    func refreshCount() async {
        guard let tenantId = SupabaseService.shared.tenantId else { return }

        let calendar = Calendar(identifier: .gregorian)
        let now = Date()
        let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate, .withFullTime, .withTimeZone]

        do {
            let response = try await SupabaseService.shared.client
                .from("payments")
                .select("id", head: true, count: .exact)
                .eq("tenant_id", value: tenantId.uuidString)
                .gte("paid_at", value: formatter.string(from: startOfMonth))

            if let count = response.count {
                currentMonthCount = count
                lastUpdated = Date()
                saveCache()
                logger.info("月間会計数を更新: \(count)")
            }
        } catch {
            logger.warning("月間会計数の取得に失敗: \(error.localizedDescription)")
            // キャッシュから復元
            loadCache()
        }
    }

    // MARK: - キャッシュ

    private func saveCache() {
        UserDefaults.standard.set(currentMonthCount, forKey: "luna_freemium_count")
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: "luna_freemium_updated")

        // 月が変わったらリセット
        let monthKey = {
            let d = Date()
            let cal = Calendar(identifier: .gregorian)
            return "\(cal.component(.year, from: d))-\(cal.component(.month, from: d))"
        }()
        UserDefaults.standard.set(monthKey, forKey: "luna_freemium_month")
    }

    private func loadCache() {
        let currentMonth = {
            let d = Date()
            let cal = Calendar(identifier: .gregorian)
            return "\(cal.component(.year, from: d))-\(cal.component(.month, from: d))"
        }()
        let cachedMonth = UserDefaults.standard.string(forKey: "luna_freemium_month") ?? ""

        if currentMonth == cachedMonth {
            currentMonthCount = UserDefaults.standard.integer(forKey: "luna_freemium_count")
        } else {
            // 月が変わったのでリセット
            currentMonthCount = 0
            saveCache()
        }
    }
}
