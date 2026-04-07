import Foundation
import SwiftUI

@Observable
final class AppViewModel {
    private static let storageKey = "luna_app_state"

    var rooms: [Room]
    var tables: [FloorTable]
    var casts: [Cast]
    var customers: [Customer]
    var menuItems: [MenuItem]
    var visits: [Visit]
    var payments: [Payment]
    var setPlans: [SetPlan]
    var registerStartAmount: Int
    var cashWithdrawals: [CashWithdrawal]

    // Supabase連携
    var storeSettings = StoreSettings()
    var isLoadedFromSupabase = false
    let syncEngine = SyncEngine()

    init() {
        // マスタデータ（rooms/tables/casts/menuItems/setPlans/customers）は
        // 常にMockDataで初期化 → Supabase同期時に上書きされる
        let master = MockData.defaultState
        rooms = master.rooms
        tables = master.tables
        casts = master.casts
        customers = master.customers
        menuItems = master.menuItems
        setPlans = master.setPlans

        // 営業データはローカルから復元
        let ops = Self.loadOperationalState()
        visits = ops.visits
        payments = ops.payments
        registerStartAmount = ops.registerStartAmount
        cashWithdrawals = ops.cashWithdrawals

        // テーブルのvisitId/statusを営業データから復元
        for visit in visits where !visit.isCheckedOut {
            if let idx = tables.firstIndex(where: { $0.id == visit.tableId }) {
                tables[idx].status = .occupied
                tables[idx].visitId = visit.id
            }
        }
    }

    // MARK: - Persistence (営業データのみ保存)

    private struct OperationalState: Codable {
        var visits: [Visit]
        var payments: [Payment]
        var registerStartAmount: Int
        var cashWithdrawals: [CashWithdrawal]
    }

    private static func loadOperationalState() -> OperationalState {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let state = try? JSONDecoder().decode(OperationalState.self, from: data)
        else {
            // 保存データなし → 空の状態で開始（モックデータは入れない）
            // Supabase認証済みの場合、モックのvisit/paymentを入れるとFK違反になるため
            return OperationalState(
                visits: [],
                payments: [],
                registerStartAmount: 0,
                cashWithdrawals: []
            )
        }
        return state
    }

    func save() {
        let state = OperationalState(
            visits: visits,
            payments: payments,
            registerStartAmount: registerStartAmount,
            cashWithdrawals: cashWithdrawals
        )
        if let data = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(data, forKey: Self.storageKey)
        }
    }

    // MARK: - Table

    func openTable(tableId: String, customerName: String?, guestCount: Int, nominations: [CastNomination], douhanCastId: String?) {
        // 既にvisitがあるテーブルには二重で卓を立てない
        if let table = tables.first(where: { $0.id == tableId }), table.visitId != nil { return }
        let visit = Visit(
            tableId: tableId,
            customerName: customerName,
            guestCount: guestCount,
            nominations: nominations,
            douhanCastId: douhanCastId,
            setMinutes: 60
        )
        visits.append(visit)
        if let idx = tables.firstIndex(where: { $0.id == tableId }) {
            tables[idx].status = .occupied
            tables[idx].visitId = visit.id
            syncEngine.syncFloorTable(tables[idx])
        }
        save()
        syncEngine.syncVisit(visit)
    }

    func closeTable(tableId: String) {
        if let idx = tables.firstIndex(where: { $0.id == tableId }) {
            tables[idx].status = .empty
            tables[idx].visitId = nil
        }
        save()
    }

    func moveVisit(fromTableId: String, toTableId: String) {
        guard let fromIdx = tables.firstIndex(where: { $0.id == fromTableId }),
              let visitId = tables[fromIdx].visitId,
              let toIdx = tables.firstIndex(where: { $0.id == toTableId })
        else { return }

        tables[fromIdx].status = .empty
        tables[fromIdx].visitId = nil
        tables[toIdx].status = .occupied
        tables[toIdx].visitId = visitId

        if let vIdx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[vIdx].tableId = toTableId
        }
        save()
    }

    func updateTableStatus(tableId: String, status: TableStatus) {
        if let idx = tables.firstIndex(where: { $0.id == tableId }) {
            tables[idx].status = status
        }
        save()
    }

    // MARK: - Visit

    func visit(for tableId: String) -> Visit? {
        guard let table = tables.first(where: { $0.id == tableId }),
              let visitId = table.visitId
        else { return nil }
        return visits.first(where: { $0.id == visitId })
    }

    func updateGuestCount(visitId: String, count: Int) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            let newCount = max(1, count)
            let visit = visits[idx]
            let elapsed = visit.checkInTime.elapsedMinutes()
            let withinSet = elapsed < visit.setMinutes

            if withinSet {
                // セット時間内: セット人数も連動
                let diff = newCount - visit.guestCount
                visits[idx].guestCount = newCount
                visits[idx].setGuestCount = max(1, visit.setGuestCount + diff)
            } else {
                // セット超過後: 総人数のみ変更（セット人数は据え置き）
                visits[idx].guestCount = newCount
            }

            // 延長アイテムの数量は変更しない（追加時の人数を保持）
        }
        save()
    }

    func updateCustomerName(visitId: String, name: String?) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].customerName = name
        }
        save()
    }

    func updateVisitNominations(visitId: String, nominations: [CastNomination], douhanCastId: String?) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].nominations = nominations
            visits[idx].douhanCastId = douhanCastId
        }
        save()
    }

    func updateNominationQty(visitId: String, castId: String, qty: Int) {
        if let vIdx = visits.firstIndex(where: { $0.id == visitId }) {
            if let nIdx = visits[vIdx].nominations.firstIndex(where: { $0.castId == castId }) {
                visits[vIdx].nominations[nIdx].qty = max(1, qty)
            }
        }
        save()
    }

    func updateDouhanQty(visitId: String, qty: Int) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].douhanQty = max(1, qty)
        }
        save()
    }

    // MARK: - Order

    func addOrderItem(visitId: String, item: OrderItem) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].orderItems.append(item)
        }
        save()
    }

    func removeOrderItem(visitId: String, itemId: String) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].orderItems.removeAll(where: { $0.id == itemId })
        }
        save()
    }

    func updateOrderItemPrice(visitId: String, itemId: String, price: Int) {
        if let vIdx = visits.firstIndex(where: { $0.id == visitId }),
           let iIdx = visits[vIdx].orderItems.firstIndex(where: { $0.id == itemId }) {
            visits[vIdx].orderItems[iIdx].price = price
        }
        save()
    }

    // MARK: - Price Overrides

    func updateSetPrice(visitId: String, price: Int) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].setPriceOverride = price
        }
        save()
    }

    func updateNominationFee(visitId: String, castId: String, fee: Int) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].nominationFeeOverrides[castId] = fee
        }
        save()
    }

    func updateDouhanFee(visitId: String, fee: Int) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].douhanFeeOverride = fee
        }
        save()
    }

    // MARK: - Extension

    func addExtension(visitId: String, minutes: Int, pricePerPerson: Int) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            visits[idx].extensionMinutes += minutes
            let extItem = OrderItem(
                menuItemId: "ext_\(Date().timeIntervalSince1970)",
                menuItemName: "延長\(minutes)分",
                price: pricePerPerson,
                quantity: visits[idx].guestCount
            )
            visits[idx].orderItems.append(extItem)
        }
        save()
    }

    func removeLastExtension(visitId: String) {
        if let idx = visits.firstIndex(where: { $0.id == visitId }) {
            if let extIdx = visits[idx].orderItems.lastIndex(where: { $0.menuItemId.hasPrefix("ext_") }) {
                visits[idx].extensionMinutes = max(0, visits[idx].extensionMinutes - 30)
                visits[idx].orderItems.remove(at: extIdx)
            }
        }
        save()
    }

    // MARK: - Checkout

    func checkout(payment: Payment) {
        if let vIdx = visits.firstIndex(where: { $0.id == payment.visitId }) {
            visits[vIdx].isCheckedOut = true
            visits[vIdx].checkOutTime = payment.paidAt
            syncEngine.syncVisit(visits[vIdx])
        }
        if let tIdx = tables.firstIndex(where: { $0.id == payment.tableId }) {
            tables[tIdx].status = .empty
            tables[tIdx].visitId = nil
            syncEngine.syncFloorTable(tables[tIdx])
        }
        // Update customer
        if let visit = visits.first(where: { $0.id == payment.visitId }),
           let customerId = visit.customerId,
           let cIdx = customers.firstIndex(where: { $0.id == customerId }) {
            customers[cIdx].visitCount += 1
            customers[cIdx].totalSpend += payment.total
            if customers[cIdx].visitCount >= 10 {
                customers[cIdx].rank = .vip
            } else if customers[cIdx].visitCount >= 3 {
                customers[cIdx].rank = .repeat
            }
            syncEngine.syncCustomer(customers[cIdx])
        }
        payments.append(payment)
        save()
        syncEngine.syncPayment(payment)
    }

    // MARK: - Cast

    func clockIn(castId: String) {
        if let idx = casts.firstIndex(where: { $0.id == castId }) {
            // 既に出勤中の場合は二重打刻を防ぐ
            guard !casts[idx].isWorking else { return }
            let shiftId = UUID().uuidString
            casts[idx].isWorking = true
            casts[idx].clockInTime = Date()
            casts[idx].clockOutTime = nil
            casts[idx].dropOffConfirmed = false
            casts[idx].currentShiftId = shiftId
            syncEngine.syncCastShift(
                shiftId: shiftId,
                castId: castId, clockIn: Date(), clockOut: nil,
                scheduledIn: casts[idx].scheduledClockIn,
                scheduledOut: casts[idx].scheduledClockOut,
                cast: casts[idx]
            )
        }
        save()
    }

    func clockOut(castId: String) {
        if let idx = casts.firstIndex(where: { $0.id == castId }) {
            casts[idx].isWorking = false
            casts[idx].clockOutTime = Date()
            if let clockIn = casts[idx].clockInTime,
               let shiftId = casts[idx].currentShiftId {
                syncEngine.syncCastShift(
                    shiftId: shiftId,
                    castId: castId, clockIn: clockIn, clockOut: Date(),
                    scheduledIn: casts[idx].scheduledClockIn,
                    scheduledOut: casts[idx].scheduledClockOut,
                    cast: casts[idx]
                )
            }
        }
        save()
    }

    func addCast(stageName: String, realName: String, photo: String?, scheduledClockIn: String?, scheduledClockOut: String?, dropOffLocation: String?) {
        let cast = Cast(
            id: UUID().uuidString,
            stageName: stageName,
            realName: realName,
            isWorking: false,
            scheduledClockIn: scheduledClockIn,
            scheduledClockOut: scheduledClockOut,
            dropOffLocation: dropOffLocation,
            photo: photo
        )
        casts.append(cast)
        save()
        syncEngine.syncCast(cast)
    }

    func updateCast(id: String, stageName: String, realName: String, photo: String?, scheduledClockIn: String?, scheduledClockOut: String?, dropOffLocation: String?) {
        if let idx = casts.firstIndex(where: { $0.id == id }) {
            casts[idx].stageName = stageName
            casts[idx].realName = realName
            casts[idx].photo = photo
            casts[idx].scheduledClockIn = scheduledClockIn
            casts[idx].scheduledClockOut = scheduledClockOut
            casts[idx].dropOffLocation = dropOffLocation
            syncEngine.syncCast(casts[idx])
        }
        save()
    }

    func updateCastDropOff(castId: String, dropOff: String?) {
        if let idx = casts.firstIndex(where: { $0.id == castId }) {
            casts[idx].dropOffLocation = dropOff
            casts[idx].dropOffConfirmed = true
        }
        save()
    }

    // MARK: - Menu

    func addMenuItem(name: String, price: Int, category: MenuCategory) {
        let item = MenuItem(id: UUID().uuidString, name: name, price: price, category: category, isActive: true)
        menuItems.append(item)
        save()
    }

    func toggleMenuItem(id: String) {
        if let idx = menuItems.firstIndex(where: { $0.id == id }) {
            menuItems[idx].isActive.toggle()
        }
        save()
    }

    // MARK: - Room

    func addRoom(name: String) {
        rooms.append(Room(id: UUID().uuidString, name: name))
        save()
    }

    func updateRoom(id: String, name: String) {
        if let idx = rooms.firstIndex(where: { $0.id == id }) {
            rooms[idx].name = name
        }
        save()
    }

    func deleteRoom(id: String) {
        guard rooms.count > 1 else { return }
        let fallbackId = rooms.first(where: { $0.id != id })!.id
        rooms.removeAll(where: { $0.id == id })
        for i in tables.indices where tables[i].roomId == id {
            tables[i].roomId = fallbackId
        }
        save()
    }

    func moveTableRoom(tableId: String, roomId: String) {
        if let idx = tables.firstIndex(where: { $0.id == tableId }) {
            tables[idx].roomId = roomId
        }
        save()
    }

    func updateTablePosition(tableId: String, x: Int, y: Int) {
        if let idx = tables.firstIndex(where: { $0.id == tableId }) {
            tables[idx].position = TablePosition(x: x, y: y)
        }
        save()
    }

    // MARK: - Register

    func setRegisterStart(amount: Int) {
        registerStartAmount = amount
        save()
    }

    func addCashWithdrawal(amount: Int, note: String?) {
        let withdrawal = CashWithdrawal(amount: amount, note: note)
        cashWithdrawals.append(withdrawal)
        save()
        syncEngine.syncCashWithdrawal(withdrawal)
    }

    // MARK: - Computed

    var totalSales: Int {
        todayPayments.reduce(0) { $0 + $1.total }
    }

    /// 営業日の開始時刻（当日12:00〜翌日12:00を1営業日とする）
    var businessDayStart: Date {
        let cal = Calendar.current
        let now = Date()
        let noon = cal.date(bySettingHour: 12, minute: 0, second: 0, of: now)!
        return now >= noon ? noon : cal.date(byAdding: .day, value: -1, to: noon)!
    }

    var todayPayments: [Payment] {
        let start = businessDayStart
        return payments.filter { $0.paidAt >= start }
    }

    var todayVisits: [Visit] {
        let start = businessDayStart
        return visits.filter { $0.checkInTime >= start }
    }

    var workingCasts: [Cast] {
        casts.filter(\.isWorking)
    }

    func castNominations(castId: String) -> Int {
        let start = businessDayStart
        return visits.filter { v in
            v.checkInTime >= start &&
            v.nominations.contains(where: { $0.castId == castId && $0.nominationType != .none })
        }.count
    }

    func castSales(castId: String) -> Int {
        // 管理画面・キャスト画面と同じ計算方式: subtotalを本指名数で按分
        return todayPayments.compactMap { p -> Int? in
            guard let visit = visits.first(where: { $0.id == p.visitId }) else { return nil }
            let mainNominations = visit.nominations.filter { $0.nominationType == .main }
            guard mainNominations.contains(where: { $0.castId == castId }) else { return nil }
            let totalMainNoms = mainNominations.reduce(0) { $0 + $1.qty }
            let myNoms = mainNominations.filter { $0.castId == castId }.reduce(0) { $0 + $1.qty }
            guard totalMainNoms > 0 else { return nil }
            return Int(Double(p.subtotal) / Double(totalMainNoms) * Double(myNoms))
        }.reduce(0, +)
    }
}
