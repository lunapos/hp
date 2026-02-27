import Foundation

// MARK: - Table

enum TableStatus: String, Codable, Sendable {
    case empty
    case occupied
    case waitingCheckout = "waiting_checkout"
}

struct Room: Identifiable, Codable, Sendable, Hashable {
    var id: String
    var name: String
}

struct TablePosition: Codable, Sendable, Hashable {
    var x: Int
    var y: Int
}

struct FloorTable: Identifiable, Codable, Sendable, Hashable {
    var id: String
    var name: String
    var capacity: Int
    var status: TableStatus
    var position: TablePosition
    var visitId: String?
    var roomId: String
}

// MARK: - Cast

struct Cast: Identifiable, Codable, Sendable, Hashable {
    var id: String
    var stageName: String
    var realName: String
    var isWorking: Bool
    var clockInTime: Date?
    var clockOutTime: Date?
    var scheduledClockIn: String?
    var scheduledClockOut: String?
    var dropOffLocation: String?
    var photo: String?
}

// MARK: - Customer

enum CustomerRank: String, Codable, Sendable {
    case new
    case `repeat`
    case vip
}

struct Customer: Identifiable, Codable, Sendable {
    var id: String
    var name: String
    var phone: String?
    var visitCount: Int
    var totalSpend: Int
    var notes: String?
    var rank: CustomerRank
    var favoriteCastId: String?
}

// MARK: - Menu

enum MenuCategory: String, Codable, CaseIterable, Sendable {
    case drink
    case bottle
    case food
    case ladiesDrink = "ladies_drink"
    case other

    var label: String {
        switch self {
        case .drink: "ドリンク"
        case .bottle: "ボトル"
        case .food: "フード"
        case .ladiesDrink: "レディース"
        case .other: "その他"
        }
    }
}

struct MenuItem: Identifiable, Codable, Sendable {
    var id: String
    var name: String
    var price: Int
    var category: MenuCategory
    var isActive: Bool
}

// MARK: - Order

struct OrderItem: Identifiable, Codable, Sendable {
    var id: String
    var menuItemId: String
    var menuItemName: String
    var price: Int
    var quantity: Int
    var isExpense: Bool
    var castId: String?
    var note: String?

    init(id: String = UUID().uuidString, menuItemId: String, menuItemName: String, price: Int, quantity: Int, isExpense: Bool = false, castId: String? = nil, note: String? = nil) {
        self.id = id
        self.menuItemId = menuItemId
        self.menuItemName = menuItemName
        self.price = price
        self.quantity = quantity
        self.isExpense = isExpense
        self.castId = castId
        self.note = note
    }
}

// MARK: - Nomination

enum NominationType: String, Codable, Sendable {
    case none
    case inStore = "in_store"
    case main
}

struct CastNomination: Codable, Sendable, Hashable {
    var castId: String
    var nominationType: NominationType
    var qty: Int

    init(castId: String, nominationType: NominationType, qty: Int = 1) {
        self.castId = castId
        self.nominationType = nominationType
        self.qty = qty
    }
}

// MARK: - Visit

struct Visit: Identifiable, Codable, Sendable {
    var id: String
    var tableId: String
    var customerId: String?
    var customerName: String?
    var guestCount: Int
    var setGuestCount: Int
    var nominations: [CastNomination]
    var douhanCastId: String?
    var douhanQty: Int
    var checkInTime: Date
    var checkOutTime: Date?
    var orderItems: [OrderItem]
    var setMinutes: Int
    var extensionMinutes: Int
    var setPriceOverride: Int?
    var nominationFeeOverrides: [String: Int]
    var douhanFeeOverride: Int?
    var isCheckedOut: Bool

    init(
        id: String = UUID().uuidString,
        tableId: String,
        customerId: String? = nil,
        customerName: String? = nil,
        guestCount: Int,
        setGuestCount: Int? = nil,
        nominations: [CastNomination] = [],
        douhanCastId: String? = nil,
        douhanQty: Int = 1,
        checkInTime: Date = Date(),
        checkOutTime: Date? = nil,
        orderItems: [OrderItem] = [],
        setMinutes: Int = 60,
        extensionMinutes: Int = 0,
        setPriceOverride: Int? = nil,
        nominationFeeOverrides: [String: Int] = [:],
        douhanFeeOverride: Int? = nil,
        isCheckedOut: Bool = false
    ) {
        self.id = id
        self.tableId = tableId
        self.customerId = customerId
        self.customerName = customerName
        self.guestCount = guestCount
        self.setGuestCount = setGuestCount ?? guestCount
        self.nominations = nominations
        self.douhanCastId = douhanCastId
        self.douhanQty = douhanQty
        self.checkInTime = checkInTime
        self.checkOutTime = checkOutTime
        self.orderItems = orderItems
        self.setMinutes = setMinutes
        self.extensionMinutes = extensionMinutes
        self.setPriceOverride = setPriceOverride
        self.nominationFeeOverrides = nominationFeeOverrides
        self.douhanFeeOverride = douhanFeeOverride
        self.isCheckedOut = isCheckedOut
    }

    var totalSetMinutes: Int { setMinutes + extensionMinutes }
}

// MARK: - Payment

enum PaymentMethod: String, Codable, CaseIterable, Sendable {
    case cash
    case credit
    case electronic
    case tab

    var label: String {
        switch self {
        case .cash: "現金"
        case .credit: "カード"
        case .electronic: "電子"
        case .tab: "ツケ"
        }
    }

    var icon: String {
        switch self {
        case .cash: "yensign"
        case .credit: "creditcard"
        case .electronic: "iphone"
        case .tab: "book"
        }
    }
}

struct Payment: Identifiable, Codable, Sendable {
    var id: String
    var visitId: String
    var tableId: String
    var customerName: String?
    var subtotal: Int
    var expenseTotal: Int
    var nominationFee: Int
    var serviceFee: Int
    var tax: Int
    var discount: Int
    var total: Int
    var paymentMethod: PaymentMethod
    var paidAt: Date
    var items: [OrderItem]
}

// MARK: - Set Plan

struct SetPlan: Identifiable, Codable, Sendable {
    var id: String
    var name: String
    var durationMinutes: Int
    var price: Int
    var isActive: Bool
}

// MARK: - Cash Withdrawal

struct CashWithdrawal: Codable, Sendable, Identifiable {
    var id: String
    var amount: Int
    var note: String?
    var createdAt: Date

    init(id: String = UUID().uuidString, amount: Int, note: String? = nil, createdAt: Date = Date()) {
        self.id = id
        self.amount = amount
        self.note = note
        self.createdAt = createdAt
    }
}

// MARK: - App State

struct AppState: Codable, Sendable {
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
}
