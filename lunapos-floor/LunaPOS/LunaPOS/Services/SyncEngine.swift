import Foundation
import Network

@Observable
final class SyncEngine: @unchecked Sendable {
    private let supabase = SupabaseService.shared
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "luna.sync.monitor")

    private(set) var isOnline = false
    var lastSyncError: String?

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

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            self?.isOnline = (path.status == .satisfied)
        }
        monitor.start(queue: monitorQueue)
    }

    deinit {
        monitor.cancel()
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
            print("[SyncEngine] Initial load failed: \(error)")
            setSyncError("初期データの同期に失敗しました。ローカルデータで動作します。")
        }
    }

    // MARK: - Write Sync (ローカル → Supabase)

    func syncVisit(_ visit: Visit) {
        guard let tenantId = supabase.tenantId, isOnline else { return }
        Task {
            do {
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
            } catch {
                print("[SyncEngine] Visit sync failed: \(error)")
                setSyncError("来店データの同期に失敗しました")
            }
        }
    }

    func syncFloorTable(_ table: FloorTable) {
        guard let tenantId = supabase.tenantId, isOnline else { return }
        Task {
            do {
                let row = FloorTableRow.from(table, tenantId: tenantId)
                try await supabase.upsertFloorTable(row)
            } catch {
                print("[SyncEngine] Table sync failed: \(error)")
                setSyncError("テーブルの同期に失敗しました")
            }
        }
    }

    func syncPayment(_ payment: Payment) {
        guard let tenantId = supabase.tenantId, isOnline else { return }
        Task {
            do {
                let row = PaymentRow.from(payment, tenantId: tenantId)
                try await supabase.insertPayment(row)

                let itemRows = payment.items.map {
                    PaymentItemRow.from($0, paymentId: payment.id, tenantId: tenantId)
                }
                try await supabase.insertPaymentItems(itemRows)
            } catch {
                print("[SyncEngine] Payment sync failed: \(error)")
                setSyncError("会計データの同期に失敗しました")
            }
        }
    }

    func syncCastShift(castId: String, clockIn: Date, clockOut: Date?, scheduledIn: String?, scheduledOut: String?) {
        guard let tenantId = supabase.tenantId, isOnline else { return }
        Task {
            do {
                let row = CastShiftRow(
                    id: UUID(),
                    tenantId: tenantId,
                    castId: UUID(uuidString: castId) ?? UUID(),
                    clockIn: clockIn,
                    clockOut: clockOut,
                    scheduledClockIn: scheduledIn,
                    scheduledClockOut: scheduledOut
                )
                try await supabase.upsertCastShift(row)
            } catch {
                print("[SyncEngine] Cast shift sync failed: \(error)")
                setSyncError("シフトデータの同期に失敗しました")
            }
        }
    }

    func syncCustomer(_ customer: Customer) {
        guard let tenantId = supabase.tenantId, isOnline else { return }
        Task {
            do {
                let row = CustomerRow.from(customer, tenantId: tenantId)
                try await supabase.updateCustomer(row)
            } catch {
                print("[SyncEngine] Customer sync failed: \(error)")
                setSyncError("顧客データの同期に失敗しました")
            }
        }
    }

    func syncCashWithdrawal(_ withdrawal: CashWithdrawal) {
        guard let tenantId = supabase.tenantId, isOnline else { return }
        Task {
            do {
                let row = CashWithdrawalRow.from(withdrawal, tenantId: tenantId)
                try await supabase.insertCashWithdrawal(row)
            } catch {
                print("[SyncEngine] Cash withdrawal sync failed: \(error)")
                setSyncError("出金データの同期に失敗しました")
            }
        }
    }
}
