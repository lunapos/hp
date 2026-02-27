import Foundation
import Supabase

@Observable
final class SupabaseService: @unchecked Sendable {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private(set) var tenantId: UUID?
    private(set) var deviceId: UUID?
    private(set) var isAuthenticated = false

    private init() {
        client = SupabaseClient(
            supabaseURL: URL(string: "https://mkzhepsntwnbtgfazflw.supabase.co")!,
            supabaseKey: "sb_publishable__woA3zq9IDRhxRePRZAMXw_oFhrOUfL"
        )
    }

    // MARK: - Device Auth (dev shortcut: use service key directly)

    func authenticateDevice(token: String) async throws {
        // Phase 2 proper: Edge Function でJWT取得
        // 開発用: service key でdeviceを検索して tenant_id を取得
        let devices: [DeviceRow] = try await client
            .from("devices")
            .select()
            .eq("device_token", value: token)
            .eq("is_active", value: true)
            .execute()
            .value

        guard let device = devices.first else {
            throw SupabaseServiceError.invalidDeviceToken
        }

        tenantId = device.tenantId
        deviceId = device.id
        isAuthenticated = true
    }

    // 開発用: テストテナントに直接接続
    func authenticateForDev() async throws {
        tenantId = UUID(uuidString: "a0000000-0000-0000-0000-000000000001")
        deviceId = UUID(uuidString: "d0000000-0000-0000-0000-000000000001")
        isAuthenticated = true
    }

    // MARK: - Fetch (Read-Only Tables)

    func fetchStoreSettings() async throws -> StoreSettings {
        guard let tenantId else { throw SupabaseServiceError.notAuthenticated }
        let rows: [StoreRow] = try await client
            .from("stores")
            .select()
            .eq("id", value: tenantId.uuidString)
            .execute()
            .value
        guard let store = rows.first else { throw SupabaseServiceError.noStore }
        return StoreSettings(from: store)
    }

    func fetchRooms() async throws -> [RoomRow] {
        guard let tenantId else { throw SupabaseServiceError.notAuthenticated }
        return try await client.from("rooms")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .order("sort_order")
            .execute()
            .value
    }

    func fetchFloorTables() async throws -> [FloorTableRow] {
        guard let tenantId else { throw SupabaseServiceError.notAuthenticated }
        return try await client.from("floor_tables")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .execute()
            .value
    }

    func fetchCasts() async throws -> [CastRow] {
        guard let tenantId else { throw SupabaseServiceError.notAuthenticated }
        return try await client.from("casts")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .eq("is_active", value: true)
            .execute()
            .value
    }

    func fetchCustomers() async throws -> [CustomerRow] {
        guard let tenantId else { throw SupabaseServiceError.notAuthenticated }
        return try await client.from("customers")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .execute()
            .value
    }

    func fetchMenuItems() async throws -> [MenuItemRow] {
        guard let tenantId else { throw SupabaseServiceError.notAuthenticated }
        return try await client.from("menu_items")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .eq("is_active", value: true)
            .order("sort_order")
            .execute()
            .value
    }

    func fetchSetPlans() async throws -> [SetPlanRow] {
        guard let tenantId else { throw SupabaseServiceError.notAuthenticated }
        return try await client.from("set_plans")
            .select()
            .eq("tenant_id", value: tenantId.uuidString)
            .eq("is_active", value: true)
            .execute()
            .value
    }

    // MARK: - Write Operations

    func upsertFloorTable(_ row: FloorTableRow) async throws {
        try await client.from("floor_tables")
            .upsert(row, onConflict: "id")
            .execute()
    }

    func upsertVisit(_ row: VisitRow) async throws {
        try await client.from("visits")
            .upsert(row, onConflict: "id")
            .execute()
    }

    func upsertNominations(_ rows: [NominationRow], visitId: UUID) async throws {
        // Delete existing then insert new
        try await client.from("nominations")
            .delete()
            .eq("visit_id", value: visitId.uuidString)
            .execute()
        if !rows.isEmpty {
            try await client.from("nominations")
                .insert(rows)
                .execute()
        }
    }

    func upsertOrderItems(_ rows: [OrderItemRow], visitId: UUID) async throws {
        try await client.from("order_items")
            .delete()
            .eq("visit_id", value: visitId.uuidString)
            .execute()
        if !rows.isEmpty {
            try await client.from("order_items")
                .insert(rows)
                .execute()
        }
    }

    func insertPayment(_ row: PaymentRow) async throws {
        try await client.from("payments")
            .insert(row)
            .execute()
    }

    func insertPaymentItems(_ rows: [PaymentItemRow]) async throws {
        if !rows.isEmpty {
            try await client.from("payment_items")
                .insert(rows)
                .execute()
        }
    }

    func upsertCastShift(_ row: CastShiftRow) async throws {
        try await client.from("cast_shifts")
            .upsert(row, onConflict: "id")
            .execute()
    }

    func updateCustomer(_ row: CustomerRow) async throws {
        try await client.from("customers")
            .upsert(row, onConflict: "id")
            .execute()
    }

    func insertCashWithdrawal(_ row: CashWithdrawalRow) async throws {
        try await client.from("cash_withdrawals")
            .insert(row)
            .execute()
    }
}

// MARK: - Errors

enum SupabaseServiceError: Error, LocalizedError {
    case invalidDeviceToken
    case notAuthenticated
    case noStore

    var errorDescription: String? {
        switch self {
        case .invalidDeviceToken: "無効なデバイストークンです"
        case .notAuthenticated: "未認証です"
        case .noStore: "店舗情報が見つかりません"
        }
    }
}
