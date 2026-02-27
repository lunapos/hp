import Foundation

enum MockData {
    static let rooms: [Room] = [
        Room(id: "r1", name: "Main Room"),
        Room(id: "r2", name: "VIPルーム"),
        Room(id: "r3", name: "カウンター"),
    ]

    static let tables: [FloorTable] = [
        FloorTable(id: "t1", name: "1番", capacity: 4, status: .occupied, position: TablePosition(x: 1, y: 1), visitId: "v1", roomId: "r1"),
        FloorTable(id: "t2", name: "2番", capacity: 4, status: .empty, position: TablePosition(x: 2, y: 1), roomId: "r1"),
        FloorTable(id: "t3", name: "3番", capacity: 6, status: .occupied, position: TablePosition(x: 3, y: 1), visitId: "v2", roomId: "r1"),
        FloorTable(id: "t4", name: "4番", capacity: 4, status: .waitingCheckout, position: TablePosition(x: 4, y: 1), visitId: "v3", roomId: "r1"),
        FloorTable(id: "t5", name: "5番", capacity: 4, status: .empty, position: TablePosition(x: 1, y: 2), roomId: "r1"),
        FloorTable(id: "t9", name: "6番", capacity: 4, status: .empty, position: TablePosition(x: 2, y: 2), roomId: "r1"),
        FloorTable(id: "t10", name: "7番", capacity: 4, status: .empty, position: TablePosition(x: 3, y: 2), roomId: "r1"),
        FloorTable(id: "t11", name: "8番", capacity: 4, status: .empty, position: TablePosition(x: 4, y: 2), roomId: "r1"),
        FloorTable(id: "t12", name: "9番", capacity: 4, status: .empty, position: TablePosition(x: 1, y: 3), roomId: "r1"),
        FloorTable(id: "t13", name: "10番", capacity: 4, status: .empty, position: TablePosition(x: 2, y: 3), roomId: "r1"),
        FloorTable(id: "t6", name: "VIP1", capacity: 8, status: .occupied, position: TablePosition(x: 1, y: 1), visitId: "v4", roomId: "r2"),
        FloorTable(id: "t7", name: "VIP2", capacity: 6, status: .empty, position: TablePosition(x: 2, y: 1), roomId: "r2"),
        FloorTable(id: "t14", name: "VIP3", capacity: 6, status: .empty, position: TablePosition(x: 1, y: 2), roomId: "r2"),
        FloorTable(id: "t8", name: "カウンター1", capacity: 2, status: .empty, position: TablePosition(x: 1, y: 1), roomId: "r3"),
        FloorTable(id: "t15", name: "カウンター2", capacity: 2, status: .empty, position: TablePosition(x: 2, y: 1), roomId: "r3"),
        FloorTable(id: "t16", name: "カウンター3", capacity: 2, status: .empty, position: TablePosition(x: 3, y: 1), roomId: "r3"),
    ]

    static let casts: [Cast] = [
        Cast(id: "c1", stageName: "あいり", realName: "山田愛", isWorking: true, clockInTime: Date().addingTimeInterval(-3600 * 3), photo: "cast1"),
        Cast(id: "c2", stageName: "さくら", realName: "田中咲", isWorking: true, clockInTime: Date().addingTimeInterval(-3600 * 2), photo: "cast2"),
        Cast(id: "c3", stageName: "みく", realName: "鈴木美久", isWorking: true, clockInTime: Date().addingTimeInterval(-3600 * 2.5), photo: "cast3"),
        Cast(id: "c4", stageName: "れな", realName: "佐藤礼奈", isWorking: true, clockInTime: Date().addingTimeInterval(-3600 * 1.5), photo: "cast4"),
        Cast(id: "c5", stageName: "ゆい", realName: "伊藤唯", isWorking: false, photo: "cast5"),
        Cast(id: "c6", stageName: "なな", realName: "中村奈々", isWorking: false, photo: "cast6"),
    ]

    static let menuItems: [MenuItem] = [
        MenuItem(id: "m1", name: "ウイスキー水割り", price: 1200, category: .drink, isActive: true),
        MenuItem(id: "m2", name: "ビール", price: 1000, category: .drink, isActive: true),
        MenuItem(id: "m3", name: "カクテル", price: 1200, category: .drink, isActive: true),
        MenuItem(id: "m4", name: "ソフトドリンク", price: 600, category: .drink, isActive: true),
        MenuItem(id: "m5", name: "シャンパン（グラス）", price: 3000, category: .drink, isActive: true),
        MenuItem(id: "m6", name: "ウイスキーボトル", price: 15000, category: .bottle, isActive: true),
        MenuItem(id: "m7", name: "芋焼酎ボトル", price: 12000, category: .bottle, isActive: true),
        MenuItem(id: "m8", name: "シャンパンボトル", price: 30000, category: .bottle, isActive: true),
        MenuItem(id: "m9", name: "フルーツ盛り", price: 3000, category: .food, isActive: true),
        MenuItem(id: "m10", name: "おつまみセット", price: 2000, category: .food, isActive: true),
        MenuItem(id: "m11", name: "チーズ盛り", price: 2500, category: .food, isActive: true),
        MenuItem(id: "m12", name: "レディースドリンク", price: 1500, category: .ladiesDrink, isActive: true),
    ]

    static let setPlans: [SetPlan] = [
        SetPlan(id: "sp1", name: "Main Room（60分）", durationMinutes: 60, price: 10000, isActive: true),
        SetPlan(id: "sp2", name: "T.O.C（30分）", durationMinutes: 30, price: 5000, isActive: true),
    ]

    static let customers: [Customer] = [
        Customer(id: "cu1", name: "田中様", phone: "090-1234-5678", visitCount: 15, totalSpend: 250000, notes: "ウイスキー好き", rank: .vip, favoriteCastId: "c1"),
        Customer(id: "cu2", name: "山田様", phone: "080-9876-5432", visitCount: 5, totalSpend: 75000, rank: .repeat, favoriteCastId: "c2"),
        Customer(id: "cu3", name: "佐藤様", visitCount: 1, totalSpend: 15000, rank: .new),
    ]

    // MARK: - Demo Visits (スクショ用)

    static let demoVisits: [Visit] = [
        // v1: 1番テーブル - 田中様(VIP) 35分前入店、あいり本指名
        Visit(
            id: "v1", tableId: "t1", customerId: "cu1", customerName: "田中様",
            guestCount: 2,
            nominations: [CastNomination(castId: "c1", nominationType: .main, qty: 1)],
            checkInTime: Date().addingTimeInterval(-35 * 60),
            orderItems: [
                OrderItem(menuItemId: "m1", menuItemName: "ウイスキー水割り", price: 1200, quantity: 3),
                OrderItem(menuItemId: "m12", menuItemName: "レディースドリンク", price: 1500, quantity: 2),
                OrderItem(menuItemId: "m9", menuItemName: "フルーツ盛り", price: 3000, quantity: 1),
            ],
            setMinutes: 60
        ),
        // v2: 3番テーブル - 山田様 15分前入店、さくら場内指名
        Visit(
            id: "v2", tableId: "t3", customerName: "山田様",
            guestCount: 3,
            nominations: [CastNomination(castId: "c2", nominationType: .inStore, qty: 1)],
            checkInTime: Date().addingTimeInterval(-15 * 60),
            orderItems: [
                OrderItem(menuItemId: "m2", menuItemName: "ビール", price: 1000, quantity: 2),
                OrderItem(menuItemId: "m3", menuItemName: "カクテル", price: 1200, quantity: 1),
                OrderItem(menuItemId: "m12", menuItemName: "レディースドリンク", price: 1500, quantity: 1),
            ],
            setMinutes: 60
        ),
        // v3: 4番テーブル - 会計待ち 55分前入店
        Visit(
            id: "v3", tableId: "t4", customerName: "佐藤様",
            guestCount: 2,
            nominations: [CastNomination(castId: "c4", nominationType: .main, qty: 1)],
            checkInTime: Date().addingTimeInterval(-55 * 60),
            orderItems: [
                OrderItem(menuItemId: "m1", menuItemName: "ウイスキー水割り", price: 1200, quantity: 2),
                OrderItem(menuItemId: "m10", menuItemName: "おつまみセット", price: 2000, quantity: 1),
            ],
            setMinutes: 60
        ),
        // v4: VIP1 - 大口グループ 45分前入店、みく本指名 + れな場内
        Visit(
            id: "v4", tableId: "t6", customerName: "鈴木様",
            guestCount: 4,
            nominations: [
                CastNomination(castId: "c3", nominationType: .main, qty: 1),
                CastNomination(castId: "c4", nominationType: .inStore, qty: 1),
            ],
            douhanCastId: "c3", douhanQty: 1,
            checkInTime: Date().addingTimeInterval(-45 * 60),
            orderItems: [
                OrderItem(menuItemId: "m8", menuItemName: "シャンパンボトル", price: 30000, quantity: 1),
                OrderItem(menuItemId: "m5", menuItemName: "シャンパン（グラス）", price: 3000, quantity: 4),
                OrderItem(menuItemId: "m12", menuItemName: "レディースドリンク", price: 1500, quantity: 3),
                OrderItem(menuItemId: "m9", menuItemName: "フルーツ盛り", price: 3000, quantity: 2),
            ],
            setMinutes: 60
        ),
    ]

    static let demoPayments: [Payment] = [
        Payment(
            id: "p1", visitId: "prev1", tableId: "t2",
            subtotal: 33400, expenseTotal: 0, nominationFee: 5000, serviceFee: 13360, tax: 3340,
            discount: 0, total: 55100, paymentMethod: .cash, paidAt: Date().addingTimeInterval(-90 * 60),
            items: [
                OrderItem(menuItemId: "m1", menuItemName: "ウイスキー水割り", price: 1200, quantity: 4),
                OrderItem(menuItemId: "m9", menuItemName: "フルーツ盛り", price: 3000, quantity: 1),
            ]
        ),
    ]

    static let defaultState = AppState(
        rooms: rooms,
        tables: tables,
        casts: casts,
        customers: customers,
        menuItems: menuItems,
        visits: demoVisits,
        payments: demoPayments,
        setPlans: setPlans,
        registerStartAmount: 50000,
        cashWithdrawals: []
    )
}
