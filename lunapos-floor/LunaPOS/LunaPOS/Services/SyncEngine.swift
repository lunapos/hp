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

    private func setSyncError(_ message: String, detail: String? = nil) {
        let fullMessage = detail.map { "\(message)\n\($0)" } ?? message
        Task { @MainActor in
            lastSyncError = fullMessage
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

        for (_, _) in pending {
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
            async let activeShifts = supabase.fetchActiveShifts()
            async let menuItems = supabase.fetchMenuItems()
            async let setPlans = supabase.fetchSetPlans()
            async let customers = supabase.fetchCustomers()

            let (r, t, c, aShifts, m, s, cu) = try await (rooms, tables, casts, activeShifts, menuItems, setPlans, customers)

            vm.rooms = r.map { $0.toModel() }.sorted { $0.id < $1.id }
            vm.tables = t.map { $0.toModel() }.sorted {
                if $0.position.y != $1.position.y { return $0.position.y < $1.position.y }
                if $0.position.x != $1.position.x { return $0.position.x < $1.position.x }
                return $0.id < $1.id
            }

            // キャストの isWorking / clockInTime / currentShiftId をDBの勤務中シフトから復元
            let activeShiftByCastId = Dictionary(uniqueKeysWithValues: aShifts.map { ($0.castId.uuidString, $0) })
            vm.casts = c.map { castRow in
                var cast = castRow.toModel()
                if let shift = activeShiftByCastId[cast.id] {
                    cast.isWorking = true
                    cast.clockInTime = shift.clockIn
                    cast.clockOutTime = nil
                    cast.currentShiftId = shift.id.uuidString
                }
                return cast
            }

            vm.menuItems = m.map { $0.toModel() }
            vm.setPlans = s.map { $0.toModel() }
            vm.customers = cu.map { $0.toModel() }
            vm.isLoadedFromSupabase = true

            // 営業データ（visits/payments）を取得
            await loadBusinessData(into: vm)
        } catch {
            logger.error("[SyncEngine] 初期データ同期失敗: \(error)")
            setSyncError("初期データの同期に失敗しました。ローカルデータで動作します。", detail: error.localizedDescription)
        }
    }

    /// 営業データ（visits/payments）をSupabaseから取得してローカルにマージ
    @MainActor
    private func loadBusinessData(into vm: AppViewModel) async {
        do {
            let businessStart = vm.businessDayStart

            // visits + payments を並列取得
            async let visitRows = supabase.fetchTodayVisits(since: businessStart)
            async let paymentRows = supabase.fetchTodayPayments(since: businessStart)

            let (vRows, pRows) = try await (visitRows, paymentRows)

            guard !vRows.isEmpty || !pRows.isEmpty else { return }

            // nominations + orderItems を取得
            let visitIds = vRows.map { $0.id }
            async let nominationRows = supabase.fetchNominations(visitIds: visitIds)
            async let orderItemRows = supabase.fetchOrderItems(visitIds: visitIds)

            let (nRows, oRows) = try await (nominationRows, orderItemRows)

            // visit_id -> nominations / orderItems のマップ
            let nomsByVisit = Dictionary(grouping: nRows, by: \.visitId)
            let ordersByVisit = Dictionary(grouping: oRows, by: \.visitId)

            // VisitRow -> Visit に変換
            let serverVisits = vRows.map { row in
                let noms = (nomsByVisit[row.id] ?? []).map { $0.toModel() }
                let orders = (ordersByVisit[row.id] ?? []).map { $0.toModel() }
                let feeOverrides = Dictionary(
                    uniqueKeysWithValues: (nomsByVisit[row.id] ?? [])
                        .compactMap { n -> (String, Int)? in
                            guard let fee = n.feeOverride else { return nil }
                            return (n.castId.uuidString, fee)
                        }
                )
                return row.toModel(nominations: noms, orderItems: orders, nominationFeeOverrides: feeOverrides)
            }

            // payment_items を取得
            let paymentIds = pRows.map { $0.id }
            let piRows = try await supabase.fetchPaymentItems(paymentIds: paymentIds)
            let itemsByPayment = Dictionary(grouping: piRows, by: \.paymentId)

            let serverPayments = pRows.map { row in
                let items = (itemsByPayment[row.id] ?? []).map { pi in
                    OrderItem(
                        id: pi.id.uuidString,
                        menuItemId: pi.menuItemId,
                        menuItemName: pi.menuItemName,
                        price: pi.price,
                        quantity: pi.quantity,
                        isExpense: pi.isExpense,
                        castId: pi.castId?.uuidString,
                        note: pi.note
                    )
                }
                return row.toModel(items: items)
            }

            // ローカルにないデータだけマージ（ローカルが先行書き込みなので既存は上書きしない）
            let existingVisitIds = Set(vm.visits.map(\.id))
            for visit in serverVisits where !existingVisitIds.contains(visit.id) {
                vm.visits.append(visit)
            }

            let existingPaymentIds = Set(vm.payments.map(\.id))
            for payment in serverPayments where !existingPaymentIds.contains(payment.id) {
                vm.payments.append(payment)
            }

            // visits/paymentsマージ後にテーブルstatusを正規化
            // DBのfloor_tables.statusが古いままのケースを修正する
            for idx in vm.tables.indices {
                let tableId = vm.tables[idx].id
                if let activeVisit = vm.visits.first(where: { $0.tableId == tableId && !$0.isCheckedOut }) {
                    vm.tables[idx].status = .occupied
                    vm.tables[idx].visitId = activeVisit.id
                } else {
                    vm.tables[idx].status = .empty
                    vm.tables[idx].visitId = nil
                }
            }

            logger.info("[SyncEngine] 営業データ同期完了: visits=\(serverVisits.count) payments=\(serverPayments.count)")
        } catch {
            logger.error("[SyncEngine] 営業データ同期失敗: \(error)")
        }
    }

    // MARK: - Write Sync (ローカル → Supabase)（1.2.3, 1.2.5）

    func syncVisit(_ visit: Visit) {
        guard let tenantId = supabase.tenantId else {
            logger.warning("[syncVisit] tenantId が nil — スキップ")
            return
        }
        markNeedsSync(visit.id)

        guard isOnline else {
            logger.info("[syncVisit] オフライン — 後で同期 visit_id=\(visit.id)")
            return
        }

        // デバッグ: 同期対象のvisitデータをログ出力
        logger.info("[syncVisit] 開始 visit_id=\(visit.id) table_id=\(visit.tableId) tenant_id=\(tenantId) guests=\(visit.guestCount) checked_out=\(visit.isCheckedOut)")

        Task {
            do {
                // 競合解決（1.2.5）
                if let serverDate = try? await supabase.fetchServerUpdatedAt(table: "visits", id: UUID(uuidString: visit.id) ?? UUID()) {
                    if serverDate > Date() {
                        logger.info("[syncVisit] 競合検出: サーバーが新しいためスキップ visit_id=\(visit.id)")
                        markSynced(visit.id)
                        return
                    }
                }

                let row = VisitRow.from(visit, tenantId: tenantId)
                logger.info("[syncVisit] VisitRow作成: id=\(row.id) tableId=\(row.tableId) tenantId=\(row.tenantId)")
                try await supabase.upsertVisit(row)
                logger.info("[syncVisit] upsertVisit成功")

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
                logger.info("[syncVisit] upsertNominations成功 count=\(nominationRows.count)")

                // Order items
                let orderRows = visit.orderItems.map {
                    OrderItemRow.from($0, visitId: visit.id, tenantId: tenantId)
                }
                try await supabase.upsertOrderItems(orderRows, visitId: UUID(uuidString: visit.id)!)
                logger.info("[syncVisit] upsertOrderItems成功 count=\(orderRows.count)")

                markSynced(visit.id)
                logger.info("[syncVisit] 完了 visit_id=\(visit.id)")

                // 会計完了時のみテーブルをemptyに更新（occupied方向の更新はsyncFloorTableが担当）
                // isCheckedOut=falseのvisit同期でoccupiedを書き込むと、会計後のempty更新を上書きする競合が起きる
                if visit.isCheckedOut {
                    try? await supabase.client.from("floor_tables")
                        .update(["status": "empty", "visit_id": nil] as [String: String?])
                        .eq("id", value: visit.tableId)
                        .execute()
                    logger.info("[syncVisit] テーブルをemptyに更新 table_id=\(visit.tableId)")
                }
            } catch {
                logger.error("[syncVisit] 失敗 visit_id=\(visit.id) table_id=\(visit.tableId) error=\(error)")
                markSyncFailed(visit.id)
                setSyncError("来店データの同期に失敗しました", detail: error.localizedDescription)
            }
        }
    }

    func syncFloorTable(_ table: FloorTable) {
        guard let tenantId = supabase.tenantId else { return }
        markNeedsSync(table.id)

        guard isOnline else { return }
        Task {
            do {
                // visit_idはvisit同期後に更新されるため、テーブル同期ではnullで送る
                // （visitがまだSupabaseに存在しないとFK違反になる）
                var row = FloorTableRow.from(table, tenantId: tenantId)
                row = FloorTableRow(
                    id: row.id, tenantId: row.tenantId, roomId: row.roomId,
                    name: row.name, capacity: row.capacity,
                    status: row.status, positionX: row.positionX, positionY: row.positionY,
                    visitId: nil
                )
                try await supabase.upsertFloorTable(row)
                markSynced(table.id)
            } catch {
                logger.error("[syncFloorTable] 失敗 table_id=\(table.id) error=\(error)")
                markSyncFailed(table.id)
                setSyncError("テーブルの同期に失敗しました", detail: error.localizedDescription)
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
                setSyncError("会計データの同期に失敗しました", detail: error.localizedDescription)
            }
        }
    }

    func syncCastShift(shiftId: String, castId: String, clockIn: Date, clockOut: Date?, scheduledIn: String?, scheduledOut: String?, cast: Cast? = nil) {
        guard let tenantId = supabase.tenantId else { return }
        let shiftUUID = UUID(uuidString: shiftId) ?? UUID()
        markNeedsSync(shiftId)

        guard isOnline else { return }
        Task {
            do {
                // キャストがDBに存在しない可能性があるので先にupsertする
                if let cast {
                    let castRow = CastRow(
                        id: UUID(uuidString: cast.id) ?? UUID(),
                        tenantId: tenantId,
                        stageName: cast.stageName,
                        realName: cast.realName,
                        photoUrl: cast.photo,
                        dropOffLocation: cast.dropOffLocation,
                        todayDropOffLocation: cast.todayDropOffLocation,
                        todayDropOffDate: cast.todayDropOffDate
                    )
                    try await supabase.upsertCast(castRow)
                }
                let castUUID = UUID(uuidString: castId) ?? UUID()
                // 出勤時は既存の未退勤レコードを先にクローズして制約違反を防ぐ
                if clockOut == nil {
                    try await supabase.closeOpenShifts(castId: castUUID, tenantId: tenantId, closeAt: clockIn)
                }
                let row = CastShiftRow(
                    id: shiftUUID,
                    tenantId: tenantId,
                    castId: castUUID,
                    clockIn: clockIn,
                    clockOut: clockOut,
                    scheduledClockIn: scheduledIn,
                    scheduledClockOut: scheduledOut
                )
                try await supabase.upsertCastShift(row)
                markSynced(shiftId)
            } catch {
                logger.error("[SyncEngine] Cast shift sync failed: \(error)")
                markSyncFailed(shiftId)
                setSyncError("シフトデータの同期に失敗しました", detail: error.localizedDescription)
            }
        }
    }

    func syncCast(_ cast: Cast) {
        guard let tenantId = supabase.tenantId else { return }
        markNeedsSync(cast.id)

        guard isOnline else { return }
        Task {
            do {
                let row = CastRow(
                    id: UUID(uuidString: cast.id) ?? UUID(),
                    tenantId: tenantId,
                    stageName: cast.stageName,
                    realName: cast.realName,
                    photoUrl: cast.photo,
                    dropOffLocation: cast.dropOffLocation,
                    todayDropOffLocation: cast.todayDropOffLocation,
                    todayDropOffDate: cast.todayDropOffDate
                )
                try await supabase.upsertCast(row)
                markSynced(cast.id)
            } catch {
                logger.error("[SyncEngine] Cast sync failed: \(error)")
                markSyncFailed(cast.id)
                setSyncError("キャストデータの同期に失敗しました", detail: error.localizedDescription)
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
                setSyncError("顧客データの同期に失敗しました", detail: error.localizedDescription)
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
                setSyncError("出金データの同期に失敗しました", detail: error.localizedDescription)
            }
        }
    }
}
