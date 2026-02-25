import Foundation

enum MockData {
    static let rooms: [Room] = [
        Room(id: "r1", name: "Main Room"),
        Room(id: "r2", name: "VIPルーム"),
        Room(id: "r3", name: "カウンター"),
    ]

    static let tables: [FloorTable] = [
        FloorTable(id: "t1", name: "1番", capacity: 4, status: .empty, position: TablePosition(x: 1, y: 1), roomId: "r1"),
        FloorTable(id: "t2", name: "2番", capacity: 4, status: .empty, position: TablePosition(x: 2, y: 1), roomId: "r1"),
        FloorTable(id: "t3", name: "3番", capacity: 6, status: .empty, position: TablePosition(x: 3, y: 1), roomId: "r1"),
        FloorTable(id: "t4", name: "4番", capacity: 4, status: .empty, position: TablePosition(x: 1, y: 2), roomId: "r1"),
        FloorTable(id: "t5", name: "5番", capacity: 4, status: .empty, position: TablePosition(x: 2, y: 2), roomId: "r1"),
        FloorTable(id: "t6", name: "VIP1", capacity: 8, status: .empty, position: TablePosition(x: 1, y: 1), roomId: "r2"),
        FloorTable(id: "t7", name: "VIP2", capacity: 6, status: .empty, position: TablePosition(x: 2, y: 1), roomId: "r2"),
        FloorTable(id: "t8", name: "カウンター", capacity: 4, status: .empty, position: TablePosition(x: 1, y: 1), roomId: "r3"),
    ]

    static let casts: [Cast] = [
        Cast(id: "c1", stageName: "あいり", realName: "山田愛", isWorking: false, photo: "https://i.pravatar.cc/150?img=47"),
        Cast(id: "c2", stageName: "さくら", realName: "田中咲", isWorking: false, photo: "https://i.pravatar.cc/150?img=45"),
        Cast(id: "c3", stageName: "みく", realName: "鈴木美久", isWorking: false, photo: "https://i.pravatar.cc/150?img=44"),
        Cast(id: "c4", stageName: "れな", realName: "佐藤礼奈", isWorking: false, photo: "https://i.pravatar.cc/150?img=49"),
        Cast(id: "c5", stageName: "ゆい", realName: "伊藤唯", isWorking: false, photo: "https://i.pravatar.cc/150?img=41"),
        Cast(id: "c6", stageName: "なな", realName: "中村奈々", isWorking: false, photo: "https://i.pravatar.cc/150?img=43"),
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

    static let defaultState = AppState(
        rooms: rooms,
        tables: tables,
        casts: casts,
        customers: customers,
        menuItems: menuItems,
        visits: [],
        payments: [],
        setPlans: setPlans,
        registerStartAmount: 0,
        cashWithdrawals: []
    )
}
