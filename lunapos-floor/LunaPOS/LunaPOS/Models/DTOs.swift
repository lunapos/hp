import Foundation

// MARK: - Supabase Row Types (snake_case for PostgREST)

struct DeviceRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let deviceName: String
    let deviceToken: String
    let role: String
    let isActive: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case tenantId = "tenant_id"
        case deviceName = "device_name"
        case deviceToken = "device_token"
        case role
        case isActive = "is_active"
    }
}

struct StoreRow: Codable, Sendable {
    let id: UUID
    let name: String
    let serviceRate: Double
    let taxRate: Double
    let douhanFee: Int
    let nominationFeeMain: Int
    let nominationFeeInStore: Int
    let extensionFeePerPerson: Int?
    let invoiceRegistrationNumber: String?
    let minRequiredVersion: String?
    let roundingUnit: Int?
    let roundingType: String?

    enum CodingKeys: String, CodingKey {
        case id, name
        case serviceRate = "service_rate"
        case taxRate = "tax_rate"
        case douhanFee = "douhan_fee"
        case nominationFeeMain = "nomination_fee_main"
        case nominationFeeInStore = "nomination_fee_in_store"
        case extensionFeePerPerson = "extension_fee_per_person"
        case invoiceRegistrationNumber = "invoice_registration_number"
        case minRequiredVersion = "min_required_version"
        case roundingUnit = "rounding_unit"
        case roundingType = "rounding_type"
    }
}

struct RoomRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let name: String
    let sortOrder: Int

    enum CodingKeys: String, CodingKey {
        case id, name
        case tenantId = "tenant_id"
        case sortOrder = "sort_order"
    }

    func toModel() -> Room {
        Room(id: id.uuidString, name: name)
    }
}

struct FloorTableRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let roomId: UUID
    let name: String
    let capacity: Int
    let status: String
    let positionX: Int
    let positionY: Int
    let visitId: UUID?

    enum CodingKeys: String, CodingKey {
        case id, name, capacity, status
        case tenantId = "tenant_id"
        case roomId = "room_id"
        case positionX = "position_x"
        case positionY = "position_y"
        case visitId = "visit_id"
    }

    func toModel() -> FloorTable {
        FloorTable(
            id: id.uuidString,
            name: name,
            capacity: capacity,
            status: TableStatus(rawValue: status) ?? .empty,
            position: TablePosition(x: positionX, y: positionY),
            visitId: visitId?.uuidString,
            roomId: roomId.uuidString
        )
    }

    static func from(_ model: FloorTable, tenantId: UUID) -> FloorTableRow {
        FloorTableRow(
            id: UUID(uuidString: model.id) ?? UUID(),
            tenantId: tenantId,
            roomId: UUID(uuidString: model.roomId) ?? UUID(),
            name: model.name,
            capacity: model.capacity,
            status: model.status.rawValue,
            positionX: model.position.x,
            positionY: model.position.y,
            visitId: model.visitId.flatMap { UUID(uuidString: $0) }
        )
    }
}

struct CastRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let stageName: String
    let realName: String
    let photoUrl: String?
    let dropOffLocation: String?
    let todayDropOffLocation: String?
    let todayDropOffDate: String?

    enum CodingKeys: String, CodingKey {
        case id
        case tenantId = "tenant_id"
        case stageName = "stage_name"
        case realName = "real_name"
        case photoUrl = "photo_url"
        case dropOffLocation = "drop_off_location"
        case todayDropOffLocation = "today_drop_off_location"
        case todayDropOffDate = "today_drop_off_date"
    }

    func toModel() -> Cast {
        Cast(
            id: id.uuidString,
            stageName: stageName,
            realName: realName,
            isWorking: false,
            dropOffLocation: dropOffLocation,
            todayDropOffLocation: todayDropOffLocation,
            todayDropOffDate: todayDropOffDate,
            photo: photoUrl
        )
    }
}

struct CustomerRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let name: String
    let phone: String?
    let visitCount: Int
    let totalSpend: Int
    let notes: String?
    let rank: String
    let favoriteCastId: UUID?

    enum CodingKeys: String, CodingKey {
        case id, name, phone, notes, rank
        case tenantId = "tenant_id"
        case visitCount = "visit_count"
        case totalSpend = "total_spend"
        case favoriteCastId = "favorite_cast_id"
    }

    func toModel() -> Customer {
        Customer(
            id: id.uuidString,
            name: name,
            phone: phone,
            visitCount: visitCount,
            totalSpend: totalSpend,
            notes: notes,
            rank: CustomerRank(rawValue: rank) ?? .new,
            favoriteCastId: favoriteCastId?.uuidString
        )
    }

    static func from(_ model: Customer, tenantId: UUID) -> CustomerRow {
        CustomerRow(
            id: UUID(uuidString: model.id) ?? UUID(),
            tenantId: tenantId,
            name: model.name,
            phone: model.phone,
            visitCount: model.visitCount,
            totalSpend: model.totalSpend,
            notes: model.notes,
            rank: model.rank.rawValue,
            favoriteCastId: model.favoriteCastId.flatMap { UUID(uuidString: $0) }
        )
    }
}

struct MenuItemRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let name: String
    let price: Int
    let category: String
    let isActive: Bool
    let sortOrder: Int

    enum CodingKeys: String, CodingKey {
        case id, name, price, category
        case tenantId = "tenant_id"
        case isActive = "is_active"
        case sortOrder = "sort_order"
    }

    func toModel() -> MenuItem {
        MenuItem(
            id: id.uuidString,
            name: name,
            price: price,
            category: MenuCategory(rawValue: category) ?? .other,
            isActive: isActive
        )
    }
}

struct SetPlanRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let name: String
    let durationMinutes: Int
    let price: Int
    let isActive: Bool

    enum CodingKeys: String, CodingKey {
        case id, name, price
        case tenantId = "tenant_id"
        case durationMinutes = "duration_minutes"
        case isActive = "is_active"
    }

    func toModel() -> SetPlan {
        SetPlan(
            id: id.uuidString,
            name: name,
            durationMinutes: durationMinutes,
            price: price,
            isActive: isActive
        )
    }
}

struct VisitRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let tableId: UUID
    let customerId: UUID?
    let customerName: String?
    let guestCount: Int
    let douhanCastId: UUID?
    let douhanQty: Int
    let checkInTime: Date
    let checkOutTime: Date?
    let setMinutes: Int
    let extensionMinutes: Int
    let setPriceOverride: Int?
    let douhanFeeOverride: Int?
    let isCheckedOut: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case tenantId = "tenant_id"
        case tableId = "table_id"
        case customerId = "customer_id"
        case customerName = "customer_name"
        case guestCount = "guest_count"
        case douhanCastId = "douhan_cast_id"
        case douhanQty = "douhan_qty"
        case checkInTime = "check_in_time"
        case checkOutTime = "check_out_time"
        case setMinutes = "set_minutes"
        case extensionMinutes = "extension_minutes"
        case setPriceOverride = "set_price_override"
        case douhanFeeOverride = "douhan_fee_override"
        case isCheckedOut = "is_checked_out"
    }

    func toModel(nominations: [CastNomination], orderItems: [OrderItem], nominationFeeOverrides: [String: Int]) -> Visit {
        Visit(
            id: id.uuidString,
            tableId: tableId.uuidString,
            customerId: customerId?.uuidString,
            customerName: customerName,
            guestCount: guestCount,
            nominations: nominations,
            douhanCastId: douhanCastId?.uuidString,
            douhanQty: douhanQty,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            orderItems: orderItems,
            setMinutes: setMinutes,
            extensionMinutes: extensionMinutes,
            setPriceOverride: setPriceOverride,
            nominationFeeOverrides: nominationFeeOverrides,
            douhanFeeOverride: douhanFeeOverride,
            isCheckedOut: isCheckedOut
        )
    }

    static func from(_ model: Visit, tenantId: UUID) -> VisitRow {
        VisitRow(
            id: UUID(uuidString: model.id) ?? UUID(),
            tenantId: tenantId,
            tableId: UUID(uuidString: model.tableId) ?? UUID(),
            customerId: model.customerId.flatMap { UUID(uuidString: $0) },
            customerName: model.customerName,
            guestCount: model.guestCount,
            douhanCastId: model.douhanCastId.flatMap { UUID(uuidString: $0) },
            douhanQty: model.douhanQty,
            checkInTime: model.checkInTime,
            checkOutTime: model.checkOutTime,
            setMinutes: model.setMinutes,
            extensionMinutes: model.extensionMinutes,
            setPriceOverride: model.setPriceOverride,
            douhanFeeOverride: model.douhanFeeOverride,
            isCheckedOut: model.isCheckedOut
        )
    }
}

struct NominationRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let visitId: UUID
    let castId: UUID
    let nominationType: String
    let qty: Int
    let feeOverride: Int?

    enum CodingKeys: String, CodingKey {
        case id, qty
        case tenantId = "tenant_id"
        case visitId = "visit_id"
        case castId = "cast_id"
        case nominationType = "nomination_type"
        case feeOverride = "fee_override"
    }

    func toModel() -> CastNomination {
        CastNomination(
            castId: castId.uuidString,
            nominationType: NominationType(rawValue: nominationType) ?? .none,
            qty: qty
        )
    }

    static func from(_ model: CastNomination, visitId: String, tenantId: UUID, feeOverride: Int?) -> NominationRow {
        NominationRow(
            id: UUID(),
            tenantId: tenantId,
            visitId: UUID(uuidString: visitId) ?? UUID(),
            castId: UUID(uuidString: model.castId) ?? UUID(),
            nominationType: model.nominationType.rawValue,
            qty: model.qty,
            feeOverride: feeOverride
        )
    }
}

struct OrderItemRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let visitId: UUID
    let menuItemId: String
    let menuItemName: String
    let price: Int
    let quantity: Int
    let isExpense: Bool
    let castId: UUID?
    let note: String?

    enum CodingKeys: String, CodingKey {
        case id, price, quantity, note
        case tenantId = "tenant_id"
        case visitId = "visit_id"
        case menuItemId = "menu_item_id"
        case menuItemName = "menu_item_name"
        case isExpense = "is_expense"
        case castId = "cast_id"
    }

    func toModel() -> OrderItem {
        OrderItem(
            id: id.uuidString,
            menuItemId: menuItemId,
            menuItemName: menuItemName,
            price: price,
            quantity: quantity,
            isExpense: isExpense,
            castId: castId?.uuidString,
            note: note
        )
    }

    static func from(_ model: OrderItem, visitId: String, tenantId: UUID) -> OrderItemRow {
        OrderItemRow(
            id: UUID(uuidString: model.id) ?? UUID(),
            tenantId: tenantId,
            visitId: UUID(uuidString: visitId) ?? UUID(),
            menuItemId: model.menuItemId,
            menuItemName: model.menuItemName,
            price: model.price,
            quantity: model.quantity,
            isExpense: model.isExpense,
            castId: model.castId.flatMap { UUID(uuidString: $0) },
            note: model.note
        )
    }
}

struct PaymentRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let visitId: UUID
    let tableId: UUID
    let customerName: String?
    let subtotal: Int
    let expenseTotal: Int
    let nominationFee: Int
    let serviceFee: Int
    let tax: Int
    let discount: Int
    let total: Int
    let paymentMethod: String
    let paidAt: Date

    enum CodingKeys: String, CodingKey {
        case id, subtotal, tax, discount, total
        case tenantId = "tenant_id"
        case visitId = "visit_id"
        case tableId = "table_id"
        case customerName = "customer_name"
        case expenseTotal = "expense_total"
        case nominationFee = "nomination_fee"
        case serviceFee = "service_fee"
        case paymentMethod = "payment_method"
        case paidAt = "paid_at"
    }

    func toModel(items: [OrderItem]) -> Payment {
        Payment(
            id: id.uuidString,
            visitId: visitId.uuidString,
            tableId: tableId.uuidString,
            customerName: customerName,
            subtotal: subtotal,
            expenseTotal: expenseTotal,
            nominationFee: nominationFee,
            serviceFee: serviceFee,
            tax: tax,
            discount: discount,
            total: total,
            paymentMethod: PaymentMethod(rawValue: paymentMethod) ?? .cash,
            paidAt: paidAt,
            items: items
        )
    }

    static func from(_ model: Payment, tenantId: UUID) -> PaymentRow {
        PaymentRow(
            id: UUID(uuidString: model.id) ?? UUID(),
            tenantId: tenantId,
            visitId: UUID(uuidString: model.visitId) ?? UUID(),
            tableId: UUID(uuidString: model.tableId) ?? UUID(),
            customerName: model.customerName,
            subtotal: model.subtotal,
            expenseTotal: model.expenseTotal,
            nominationFee: model.nominationFee,
            serviceFee: model.serviceFee,
            tax: model.tax,
            discount: model.discount,
            total: model.total,
            paymentMethod: model.paymentMethod.rawValue,
            paidAt: model.paidAt
        )
    }
}

struct PaymentItemRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let paymentId: UUID
    let menuItemId: String
    let menuItemName: String
    let price: Int
    let quantity: Int
    let isExpense: Bool
    let castId: UUID?
    let note: String?

    enum CodingKeys: String, CodingKey {
        case id, price, quantity, note
        case tenantId = "tenant_id"
        case paymentId = "payment_id"
        case menuItemId = "menu_item_id"
        case menuItemName = "menu_item_name"
        case isExpense = "is_expense"
        case castId = "cast_id"
    }

    static func from(_ model: OrderItem, paymentId: String, tenantId: UUID) -> PaymentItemRow {
        PaymentItemRow(
            id: UUID(),
            tenantId: tenantId,
            paymentId: UUID(uuidString: paymentId) ?? UUID(),
            menuItemId: model.menuItemId,
            menuItemName: model.menuItemName,
            price: model.price,
            quantity: model.quantity,
            isExpense: model.isExpense,
            castId: model.castId.flatMap { UUID(uuidString: $0) },
            note: model.note
        )
    }
}

struct CastShiftRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let castId: UUID
    let clockIn: Date
    let clockOut: Date?
    let scheduledClockIn: String?
    let scheduledClockOut: String?

    enum CodingKeys: String, CodingKey {
        case id
        case tenantId = "tenant_id"
        case castId = "cast_id"
        case clockIn = "clock_in"
        case clockOut = "clock_out"
        case scheduledClockIn = "scheduled_clock_in"
        case scheduledClockOut = "scheduled_clock_out"
    }
}

struct CashWithdrawalRow: Codable, Sendable {
    let id: UUID
    let tenantId: UUID
    let amount: Int
    let note: String?

    enum CodingKeys: String, CodingKey {
        case id, amount, note
        case tenantId = "tenant_id"
    }

    static func from(_ model: CashWithdrawal, tenantId: UUID) -> CashWithdrawalRow {
        CashWithdrawalRow(
            id: UUID(uuidString: model.id) ?? UUID(),
            tenantId: tenantId,
            amount: model.amount,
            note: model.note
        )
    }
}
