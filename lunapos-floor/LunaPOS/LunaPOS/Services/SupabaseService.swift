import Foundation
import Supabase
import OSLog

private let logger = Logger(subsystem: "com.luna.pos", category: "SupabaseService")

// MARK: - SupabaseError

/// Supabase操作のエラー型（1.1.6）
enum SupabaseError: Error, LocalizedError {
    case networkError(underlying: Error)
    case authError(statusCode: Int)
    case validationError(message: String)
    case serverError(statusCode: Int, message: String)
    case rateLimited
    case unknown(underlying: Error)

    var errorDescription: String? {
        switch self {
        case .networkError: "ネットワークエラーが発生しました"
        case .authError: "認証エラーが発生しました。再ログインしてください"
        case .validationError(let msg): "バリデーションエラー: \(msg)"
        case .serverError(_, let msg): "サーバーエラー: \(msg)"
        case .rateLimited: "リクエスト制限に達しました。しばらくお待ちください"
        case .unknown: "不明なエラーが発生しました"
        }
    }
}

// MARK: - Keychain Keys

private enum KeychainKey {
    static let deviceToken = "luna_device_token"
    static let accessToken = "luna_access_token"
}

@Observable
final class SupabaseService: @unchecked Sendable {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private(set) var tenantId: UUID?
    private(set) var deviceId: UUID?
    private(set) var deviceName: String?
    private(set) var isAuthenticated = false

    /// 認証エラーで再ログインが必要な状態（1.1.6）
    var needsReauthentication = false

    // anon key（apikey ヘッダー用）
    private static let supabaseURL = "https://mkzhepsntwnbtgfazflw.supabase.co"
    private static let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1remhlcHNudHduYnRnZmF6Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTY5MzEsImV4cCI6MjA4NzU3MjkzMX0.V_W-5dDPg_SX1Z6BEBdcNXPUs__VPMDQ8aV4J-qDQqs"

    /// Keychainに保存されたアクセストークン（tenant_id入りJWT）
    private var cachedAccessToken: String?

    /// accessToken クロージャから参照するための共有ストレージ
    private let tokenHolder = TokenHolder()

    private final class TokenHolder: @unchecked Sendable {
        var accessToken: String?
    }

    private init() {
        // Keychainからアクセストークンを復元
        let storedToken = KeychainHelper.load(key: KeychainKey.accessToken)
        cachedAccessToken = storedToken
        tokenHolder.accessToken = storedToken

        let holder = tokenHolder
        let anonKey = Self.anonKey

        client = SupabaseClient(
            supabaseURL: URL(string: Self.supabaseURL)!,
            supabaseKey: anonKey,
            options: SupabaseClientOptions(
                auth: SupabaseClientOptions.AuthOptions(
                    accessToken: {
                        return holder.accessToken ?? anonKey
                    }
                )
            )
        )
    }

    // MARK: - Device Auth（Edge Function経由）

    /// デバイストークンでEdge Functionを呼び、tenant_id入りJWTを取得
    func authenticateDevice(deviceToken: String) async throws {
        let url = URL(string: "\(Self.supabaseURL)/functions/v1/device-auth")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(Self.anonKey)", forHTTPHeaderField: "Authorization")
        request.setValue(Self.anonKey, forHTTPHeaderField: "apikey")
        request.httpBody = try JSONEncoder().encode(["device_token": deviceToken])

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw SupabaseError.unknown(underlying: NSError(domain: "HTTP", code: -1))
        }

        guard httpResponse.statusCode == 200 else {
            if httpResponse.statusCode == 401 {
                throw SupabaseError.authError(statusCode: 401)
            }
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError.serverError(statusCode: httpResponse.statusCode, message: body)
        }

        struct AuthResponse: Codable {
            let accessToken: String
            let tenantId: String
            let deviceId: String
            let deviceName: String
            let role: String

            enum CodingKeys: String, CodingKey {
                case accessToken = "access_token"
                case tenantId = "tenant_id"
                case deviceId = "device_id"
                case deviceName = "device_name"
                case role
            }
        }

        let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)

        // Keychainに保存（次回起動時に自動ログイン）
        KeychainHelper.save(key: KeychainKey.deviceToken, value: deviceToken)
        KeychainHelper.save(key: KeychainKey.accessToken, value: authResponse.accessToken)

        // 内部状態を更新
        cachedAccessToken = authResponse.accessToken
        tokenHolder.accessToken = authResponse.accessToken
        tenantId = UUID(uuidString: authResponse.tenantId)
        deviceId = UUID(uuidString: authResponse.deviceId)
        deviceName = authResponse.deviceName
        isAuthenticated = true

        logger.info("[authenticateDevice] 認証成功 tenant=\(authResponse.tenantId) device=\(authResponse.deviceName)")
    }

    /// Keychainに保存されたトークンで自動ログイン試行
    func tryAutoLogin() async -> Bool {
        guard let accessToken = KeychainHelper.load(key: KeychainKey.accessToken) else {
            return false
        }

        // JWTのペイロードをデコードしてtenant_id/device_idを取得
        guard let payload = decodeJWTPayload(accessToken),
              let tid = payload["tenant_id"] as? String,
              let did = payload["device_id"] as? String else {
            // 無効なJWT → クリア
            logout()
            return false
        }

        // 有効期限チェック
        if let exp = payload["exp"] as? Double, Date(timeIntervalSince1970: exp) < Date() {
            // 期限切れ → デバイストークンで再認証
            if let deviceToken = KeychainHelper.load(key: KeychainKey.deviceToken) {
                do {
                    try await authenticateDevice(deviceToken: deviceToken)
                    return true
                } catch {
                    logger.warning("[tryAutoLogin] トークン更新失敗: \(error)")
                    logout()
                    return false
                }
            }
            logout()
            return false
        }

        // 有効なJWT → そのまま使う
        cachedAccessToken = accessToken
        tokenHolder.accessToken = accessToken
        tenantId = UUID(uuidString: tid)
        deviceId = UUID(uuidString: did)
        isAuthenticated = true
        logger.info("[tryAutoLogin] 自動ログイン成功 tenant=\(tid)")
        return true
    }

    /// ログアウト（Keychainクリア）
    func logout() {
        KeychainHelper.delete(key: KeychainKey.accessToken)
        KeychainHelper.delete(key: KeychainKey.deviceToken)
        cachedAccessToken = nil
        tokenHolder.accessToken = nil
        tenantId = nil
        deviceId = nil
        deviceName = nil
        isAuthenticated = false
        needsReauthentication = false
    }

    /// Keychainにデバイストークンが保存されているか
    var hasStoredCredentials: Bool {
        KeychainHelper.load(key: KeychainKey.accessToken) != nil
    }

    // MARK: - JWT Decode Helper

    private func decodeJWTPayload(_ jwt: String) -> [String: Any]? {
        let parts = jwt.split(separator: ".")
        guard parts.count == 3 else { return nil }

        var base64 = String(parts[1])
        // base64urlをbase64に変換
        base64 = base64.replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        // パディング
        while base64.count % 4 != 0 { base64.append("=") }

        guard let data = Data(base64Encoded: base64),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return nil
        }
        return json
    }

    // MARK: - エラー変換（1.1.6）

    /// エラーをSupabaseErrorに変換。ネットワークエラーの場合はneedsSyncを維持する
    private func mapError(_ error: Error, method: String, targetId: String? = nil) -> SupabaseError {
        let idInfo = targetId.map { " target=\($0)" } ?? ""
        logger.error("[\(method)]\(idInfo) エラー: \(error.localizedDescription)")

        // URLErrorはネットワークエラー
        if let urlError = error as? URLError {
            logger.warning("[\(method)] ネットワークエラー — オフライン同期に委ねる")
            return .networkError(underlying: urlError)
        }

        // HTTPステータスコードによる分岐
        let desc = error.localizedDescription
        if desc.contains("401") || desc.contains("403") {
            logger.error("[\(method)] 認証エラー — トークンリフレッシュ試行")
            Task { @MainActor in needsReauthentication = true }
            return .authError(statusCode: desc.contains("401") ? 401 : 403)
        }
        if desc.contains("429") {
            return .rateLimited
        }
        if desc.contains("500") || desc.contains("502") || desc.contains("503") {
            return .serverError(statusCode: 500, message: desc)
        }

        return .unknown(underlying: error)
    }

    /// 指数バックオフリトライ（429対応、最大3回: 1s→2s→4s）（1.1.6）
    @discardableResult
    private func withRetry<T>(method: String, targetId: String? = nil, block: () async throws -> T) async throws -> T {
        var lastError: Error?
        for attempt in 0..<3 {
            do {
                return try await block()
            } catch {
                let mapped = mapError(error, method: method, targetId: targetId)
                if case .rateLimited = mapped {
                    let delay = pow(2.0, Double(attempt)) // 1, 2, 4
                    logger.warning("[\(method)] レート制限 — \(delay)秒後にリトライ (\(attempt + 1)/3)")
                    try? await Task.sleep(for: .seconds(delay))
                    lastError = error
                    continue
                }
                throw mapped
            }
        }
        throw mapError(lastError ?? SupabaseError.unknown(underlying: NSError()), method: method, targetId: targetId)
    }

    // MARK: - Fetch (Read-Only Tables)

    func fetchStoreSettings() async throws -> StoreSettings {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        let rows: [StoreRow] = try await client
            .from("stores")
            .select("id, name, service_rate, tax_rate, douhan_fee, nomination_fee_main, nomination_fee_in_store, invoice_registration_number")
            .eq("id", value: tenantId.uuidString)
            .execute()
            .value
        guard let store = rows.first else { throw SupabaseError.validationError(message: "店舗情報が見つかりません") }
        return StoreSettings(from: store)
    }

    func fetchRooms() async throws -> [RoomRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("rooms")
            .select("id, tenant_id, name, sort_order")
            .eq("tenant_id", value: tenantId.uuidString)
            .order("sort_order")
            .execute()
            .value
    }

    func fetchFloorTables() async throws -> [FloorTableRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("floor_tables")
            .select("id, tenant_id, room_id, name, capacity, status, position_x, position_y, visit_id")
            .eq("tenant_id", value: tenantId.uuidString)
            .execute()
            .value
    }

    func fetchCasts() async throws -> [CastRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("casts")
            .select("id, tenant_id, stage_name, real_name, photo_url, drop_off_location")
            .eq("tenant_id", value: tenantId.uuidString)
            .eq("is_active", value: true)
            .execute()
            .value
    }

    func fetchCustomers() async throws -> [CustomerRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("customers")
            .select("id, tenant_id, name, phone, visit_count, total_spend, notes, rank, favorite_cast_id")
            .eq("tenant_id", value: tenantId.uuidString)
            .execute()
            .value
    }

    func fetchMenuItems() async throws -> [MenuItemRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("menu_items")
            .select("id, tenant_id, name, price, category, is_active, sort_order")
            .eq("tenant_id", value: tenantId.uuidString)
            .eq("is_active", value: true)
            .order("sort_order")
            .execute()
            .value
    }

    func fetchSetPlans() async throws -> [SetPlanRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("set_plans")
            .select("id, tenant_id, name, duration_minutes, price, is_active")
            .eq("tenant_id", value: tenantId.uuidString)
            .eq("is_active", value: true)
            .execute()
            .value
    }

    // MARK: - Fetch Visits / Payments（営業データ）

    /// 当日の営業日（businessDayStart以降）のvisitsを取得
    func fetchTodayVisits(since: Date) async throws -> [VisitRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("visits")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .gte("check_in_time", value: ISO8601DateFormatter().string(from: since))
            .execute()
            .value
    }

    func fetchNominations(visitIds: [UUID]) async throws -> [NominationRow] {
        guard !visitIds.isEmpty else { return [] }
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        let ids = visitIds.map { $0.uuidString }
        return try await client.from("nominations")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .in("visit_id", values: ids)
            .execute()
            .value
    }

    func fetchOrderItems(visitIds: [UUID]) async throws -> [OrderItemRow] {
        guard !visitIds.isEmpty else { return [] }
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        let ids = visitIds.map { $0.uuidString }
        return try await client.from("order_items")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .in("visit_id", values: ids)
            .execute()
            .value
    }

    func fetchTodayPayments(since: Date) async throws -> [PaymentRow] {
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        return try await client.from("payments")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .gte("paid_at", value: ISO8601DateFormatter().string(from: since))
            .execute()
            .value
    }

    func fetchPaymentItems(paymentIds: [UUID]) async throws -> [PaymentItemRow] {
        guard !paymentIds.isEmpty else { return [] }
        guard let tenantId else { throw SupabaseError.authError(statusCode: 401) }
        let ids = paymentIds.map { $0.uuidString }
        return try await client.from("payment_items")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .in("payment_id", values: ids)
            .execute()
            .value
    }

    // MARK: - Write Operations（1.1.1〜1.1.5）

    /// 1.1.1 来店データのupsert
    func upsertVisit(_ row: VisitRow) async throws {
        // バリデーション: table_id, check_in_time必須
        guard row.tableId != UUID(uuidString: "00000000-0000-0000-0000-000000000000") else {
            throw SupabaseError.validationError(message: "table_idが未設定です")
        }

        try await withRetry(method: "upsertVisit", targetId: row.id.uuidString) {
            try await client.from("visits")
                .upsert(row, onConflict: "id")
                .execute()
        }
        logger.info("[upsertVisit] 成功 visit_id=\(row.id)")
    }

    func upsertFloorTable(_ row: FloorTableRow) async throws {
        try await withRetry(method: "upsertFloorTable", targetId: row.id.uuidString) {
            try await client.from("floor_tables")
                .upsert(row, onConflict: "id")
                .execute()
        }
    }

    /// 1.1.2 指名データのバルクupsert（差分同期）
    func upsertNominations(_ rows: [NominationRow], visitId: UUID) async throws {
        // 空配列の場合は既存指名を削除して終了
        guard !rows.isEmpty else {
            try await withRetry(method: "upsertNominations:delete", targetId: visitId.uuidString) {
                try await client.from("nominations")
                    .delete()
                    .eq("visit_id", value: visitId.uuidString)
                    .execute()
            }
            return
        }

        try await withRetry(method: "upsertNominations", targetId: visitId.uuidString) {
            // 差分同期: 既存を削除してから挿入
            try await client.from("nominations")
                .delete()
                .eq("visit_id", value: visitId.uuidString)
                .execute()
            try await client.from("nominations")
                .insert(rows)
                .execute()
        }
        logger.info("[upsertNominations] 成功 visit_id=\(visitId) count=\(rows.count)")
    }

    /// 1.1.3 注文アイテムのバルクupsert（差分同期）
    func upsertOrderItems(_ rows: [OrderItemRow], visitId: UUID) async throws {
        // 数量0以下のアイテムはフィルタ
        let validRows = rows.filter { $0.quantity > 0 }

        try await withRetry(method: "upsertOrderItems", targetId: visitId.uuidString) {
            try await client.from("order_items")
                .delete()
                .eq("visit_id", value: visitId.uuidString)
                .execute()
            if !validRows.isEmpty {
                try await client.from("order_items")
                    .insert(validRows)
                    .execute()
            }
        }
        logger.info("[upsertOrderItems] 成功 visit_id=\(visitId) count=\(validRows.count)")
    }

    /// 1.1.4 会計データのupsert
    func upsertPayment(_ row: PaymentRow) async throws {
        try await withRetry(method: "upsertPayment", targetId: row.id.uuidString) {
            try await client.from("payments")
                .upsert(row, onConflict: "id")
                .execute()
        }
        logger.info("[upsertPayment] 成功 payment_id=\(row.id) total=\(row.total)")
    }

    /// 1.1.4 会計明細スナップショットの保存
    func upsertPaymentItems(_ rows: [PaymentItemRow], paymentId: UUID) async throws {
        guard !rows.isEmpty else { return }

        try await withRetry(method: "upsertPaymentItems", targetId: paymentId.uuidString) {
            // 既存を削除してから挿入（冪等性確保）
            try await client.from("payment_items")
                .delete()
                .eq("payment_id", value: paymentId.uuidString)
                .execute()
            try await client.from("payment_items")
                .insert(rows)
                .execute()
        }
        logger.info("[upsertPaymentItems] 成功 payment_id=\(paymentId) count=\(rows.count)")
    }

    /// 1.1.5 出金記録のupsert
    func upsertCashWithdrawal(_ row: CashWithdrawalRow) async throws {
        // バリデーション: 金額0以下はエラー
        guard row.amount > 0 else {
            throw SupabaseError.validationError(message: "出金金額は0より大きい必要があります")
        }

        try await withRetry(method: "upsertCashWithdrawal", targetId: row.id.uuidString) {
            try await client.from("cash_withdrawals")
                .upsert(row, onConflict: "id")
                .execute()
        }
        logger.info("[upsertCashWithdrawal] 成功 amount=\(row.amount)")
    }

    func upsertCastShift(_ row: CastShiftRow) async throws {
        try await withRetry(method: "upsertCastShift", targetId: row.id.uuidString) {
            try await client.from("cast_shifts")
                .upsert(row, onConflict: "id")
                .execute()
        }
    }

    func updateCustomer(_ row: CustomerRow) async throws {
        try await withRetry(method: "updateCustomer", targetId: row.id.uuidString) {
            try await client.from("customers")
                .upsert(row, onConflict: "id")
                .execute()
        }
    }

    // MARK: - 競合解決用: サーバーのupdated_at取得（1.2.5）

    func fetchServerUpdatedAt(table: String, id: UUID) async throws -> Date? {
        struct TimestampRow: Codable {
            let updatedAt: Date
            enum CodingKeys: String, CodingKey {
                case updatedAt = "updated_at"
            }
        }
        let rows: [TimestampRow] = try await client.from(table)
            .select("updated_at")
            .eq("id", value: id.uuidString)
            .execute()
            .value
        return rows.first?.updatedAt
    }
}

// MARK: - Notification

extension Notification.Name {
    static let lunaDidLogout = Notification.Name("luna.didLogout")
}
