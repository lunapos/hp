import XCTest
@testable import LunaPOS

final class PriceCalculatorTests: XCTestCase {

    // MARK: - ヘルパー

    /// 基本的な来店データを作成
    private func makeVisit(
        guestCount: Int = 2,
        setGuestCount: Int? = nil,
        nominations: [CastNomination] = [],
        douhanCastId: String? = nil,
        douhanQty: Int = 1,
        orderItems: [OrderItem] = [],
        setMinutes: Int = 60,
        setPriceOverride: Int? = nil,
        nominationFeeOverrides: [String: Int] = [:],
        douhanFeeOverride: Int? = nil
    ) -> Visit {
        Visit(
            tableId: "t1",
            guestCount: guestCount,
            setGuestCount: setGuestCount,
            nominations: nominations,
            douhanCastId: douhanCastId,
            douhanQty: douhanQty,
            orderItems: orderItems,
            setMinutes: setMinutes,
            setPriceOverride: setPriceOverride,
            nominationFeeOverrides: nominationFeeOverrides,
            douhanFeeOverride: douhanFeeOverride
        )
    }

    /// 60分 ¥5,000 のセットプラン
    private let defaultSetPlans: [SetPlan] = [
        SetPlan(id: "sp1", name: "60分", durationMinutes: 60, price: 5000, isActive: true),
        SetPlan(id: "sp2", name: "90分", durationMinutes: 90, price: 7000, isActive: true),
        SetPlan(id: "sp3", name: "120分", durationMinutes: 120, price: 9000, isActive: true),
    ]

    // MARK: - 基本計算

    func test_基本セット料金_2名60分() {
        let visit = makeVisit(guestCount: 2, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)

        // セット: 5000 × 2名 = 10000
        XCTAssertEqual(b.setPrice, 10000)
        // 小計: 10000
        XCTAssertEqual(b.subtotal, 10000)
        // サービス料: floor(10000 × 0.4) = 4000
        XCTAssertEqual(b.serviceFee, 4000)
        // 消費税: floor(10000 × 0.1) = 1000
        XCTAssertEqual(b.tax, 1000)
        // 合計: 10000 + 4000 + 1000 = 15000
        XCTAssertEqual(b.chargedAmount, 15000)
    }

    func test_セット料金90分() {
        let visit = makeVisit(guestCount: 1, setMinutes: 90)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.setPrice, 7000)
    }

    func test_マッチしないsetMinutesは0円() {
        let visit = makeVisit(guestCount: 2, setMinutes: 45)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.setPrice, 0)
    }

    func test_setGuestCountが別指定() {
        // guestCount=3だがセット対象は2名
        let visit = makeVisit(guestCount: 3, setGuestCount: 2, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.setPrice, 10000) // 5000 × 2
    }

    // MARK: - セット料金上書き

    func test_setPriceOverride() {
        let visit = makeVisit(guestCount: 2, setMinutes: 60, setPriceOverride: 8000)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.setPrice, 8000)
    }

    // MARK: - 指名料

    func test_本指名料() {
        let nominations = [CastNomination(castId: "c1", nominationType: .main)]
        let visit = makeVisit(nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.nominationFees, 5000) // デフォルト本指名料
    }

    func test_場内指名料() {
        let nominations = [CastNomination(castId: "c1", nominationType: .inStore)]
        let visit = makeVisit(nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.nominationFees, 2000) // デフォルト場内指名料
    }

    func test_指名なしは0円() {
        let nominations = [CastNomination(castId: "c1", nominationType: .none)]
        let visit = makeVisit(nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.nominationFees, 0)
    }

    func test_複数指名() {
        let nominations = [
            CastNomination(castId: "c1", nominationType: .main),
            CastNomination(castId: "c2", nominationType: .inStore),
            CastNomination(castId: "c3", nominationType: .main, qty: 2),
        ]
        let visit = makeVisit(nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        // 5000 + 2000 + 5000*2 = 17000
        XCTAssertEqual(b.nominationFees, 17000)
    }

    func test_指名料上書き() {
        let nominations = [CastNomination(castId: "c1", nominationType: .main)]
        let visit = makeVisit(nominations: nominations, setMinutes: 60, nominationFeeOverrides: ["c1": 3000])
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.nominationFees, 3000) // 上書き値
    }

    // MARK: - 同伴料

    func test_同伴料_同伴あり() {
        let visit = makeVisit(douhanCastId: "c1", douhanQty: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.douhanFee, 3000) // デフォルト同伴料
    }

    func test_同伴料_同伴なし() {
        let visit = makeVisit(douhanCastId: nil, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.douhanFee, 0)
    }

    func test_同伴料_複数回() {
        let visit = makeVisit(douhanCastId: "c1", douhanQty: 2, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.douhanFee, 6000) // 3000 × 2
    }

    func test_同伴料上書き() {
        let visit = makeVisit(douhanCastId: "c1", douhanQty: 1, setMinutes: 60, douhanFeeOverride: 5000)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.douhanFee, 5000)
    }

    // MARK: - オーダー

    func test_通常オーダー() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "ドリンク", price: 1000, quantity: 2),
            OrderItem(menuItemId: "m2", menuItemName: "フード", price: 500, quantity: 1),
        ]
        let visit = makeVisit(orderItems: items, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.regularOrderTotal, 2500) // 1000*2 + 500*1
        XCTAssertEqual(b.expenseTotal, 0)
    }

    func test_建て替えアイテムは小計に含まない() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "ドリンク", price: 1000, quantity: 1),
            OrderItem(menuItemId: "m2", menuItemName: "タクシー代", price: 3000, quantity: 1, isExpense: true),
        ]
        let visit = makeVisit(orderItems: items, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertEqual(b.regularOrderTotal, 1000)
        XCTAssertEqual(b.expenseTotal, 3000)
        // 小計にはexpenseが含まれない
        XCTAssertEqual(b.subtotal, 10000 + 1000) // セット(5000×2) + ドリンク
    }

    // MARK: - total()

    func test_total_割引なし() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans)
        // セット5000, サービス2000, 税500 = 7500
        XCTAssertEqual(total, 7500)
    }

    func test_total_割引あり() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 1000)
        // 7500 - 1000 = 6500
        XCTAssertEqual(total, 6500)
    }

    func test_total_割引が合計を超えてもマイナスにならない() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 100000)
        // max(0, 7500 - 100000) = 0
        XCTAssertEqual(total, 0)
    }

    func test_total_建て替えは割引後に加算() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "タクシー代", price: 2000, quantity: 1, isExpense: true),
        ]
        let visit = makeVisit(guestCount: 1, orderItems: items, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 100000)
        // max(0, chargedAmount - 100000) + 2000 = 0 + 2000
        XCTAssertEqual(total, 2000)
    }

    // MARK: - StoreSettings反映

    func test_カスタム設定反映() {
        let settings = StoreSettings()
        settings.serviceRate = 0.3
        settings.taxRate = 0.08
        settings.nominationFeeMain = 8000

        let nominations = [CastNomination(castId: "c1", nominationType: .main)]
        let visit = makeVisit(guestCount: 1, nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: settings)

        XCTAssertEqual(b.nominationFees, 8000)
        // 小計: 5000 + 8000 = 13000
        XCTAssertEqual(b.subtotal, 13000)
        // サービス料: floor(13000 × 0.3) = 3900
        XCTAssertEqual(b.serviceFee, 3900)
        // 税: floor(13000 × 0.08) = 1040
        XCTAssertEqual(b.tax, 1040)
    }

    func test_settings_nilはデフォルト値を使用() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: nil)
        // デフォルト: サービス料40%, 税10%
        XCTAssertEqual(b.serviceFee, 2000) // 5000 × 0.4
        XCTAssertEqual(b.tax, 500) // 5000 × 0.1
    }

    // MARK: - 複合テスト

    func test_全要素組み合わせ() {
        let settings = StoreSettings()
        let nominations = [
            CastNomination(castId: "c1", nominationType: .main),
            CastNomination(castId: "c2", nominationType: .inStore),
        ]
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "ドリンク", price: 1000, quantity: 3),
            OrderItem(menuItemId: "m2", menuItemName: "タクシー代", price: 5000, quantity: 1, isExpense: true),
        ]
        let visit = makeVisit(
            guestCount: 2,
            nominations: nominations,
            douhanCastId: "c3",
            douhanQty: 1,
            orderItems: items,
            setMinutes: 60
        )
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: settings)

        // セット: 5000 × 2 = 10000
        XCTAssertEqual(b.setPrice, 10000)
        // 指名: 5000(本) + 2000(場内) = 7000
        XCTAssertEqual(b.nominationFees, 7000)
        // 同伴: 3000
        XCTAssertEqual(b.douhanFee, 3000)
        // ドリンク: 1000 × 3 = 3000
        XCTAssertEqual(b.regularOrderTotal, 3000)
        // 建て替え: 5000
        XCTAssertEqual(b.expenseTotal, 5000)
        // 小計: 10000 + 7000 + 3000 + 3000 = 23000
        XCTAssertEqual(b.subtotal, 23000)
        // サービス料: floor(23000 × 0.4) = 9200
        XCTAssertEqual(b.serviceFee, 9200)
        // 税: floor(23000 × 0.1) = 2300
        XCTAssertEqual(b.tax, 2300)
        // 課税後: 23000 + 9200 + 2300 = 34500
        XCTAssertEqual(b.chargedAmount, 34500)

        // total (割引1000)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 1000, settings: settings)
        // max(0, 34500 - 1000) + 5000 = 33500 + 5000 = 38500
        XCTAssertEqual(total, 38500)
    }

    // MARK: - 端数テスト

    func test_端数切り捨て() {
        let settings = StoreSettings()
        settings.serviceRate = 0.15
        settings.taxRate = 0.1

        // 小計が端数を生む値
        let visit = makeVisit(guestCount: 1, setMinutes: 60, setPriceOverride: 3333)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: settings)

        // サービス料: floor(3333 × 0.15) = floor(499.95) = 499
        XCTAssertEqual(b.serviceFee, 499)
        // 税: floor(3333 × 0.1) = floor(333.3) = 333
        XCTAssertEqual(b.tax, 333)
    }
}
