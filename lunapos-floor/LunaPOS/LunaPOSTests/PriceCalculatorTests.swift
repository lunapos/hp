import XCTest
@testable import LunaPOS

final class PriceCalculatorTests: XCTestCase {

    // MARK: - 1.4.1 テスト基盤

    /// テスト用StoreSettingsファクトリ（デフォルト: 税率10%, サービス料40%）
    private func makeSettings(
        taxRate: Double = 0.1,
        serviceRate: Double = 0.4,
        nominationFeeMain: Int = 5000,
        nominationFeeInStore: Int = 2000,
        douhanFee: Int = 3000,
        extensionFeePerPerson: Int = 5000
    ) -> StoreSettings {
        let s = StoreSettings()
        s.taxRate = taxRate
        s.serviceRate = serviceRate
        s.nominationFeeMain = nominationFeeMain
        s.nominationFeeInStore = nominationFeeInStore
        s.douhanFee = douhanFee
        s.extensionFeePerPerson = extensionFeePerPerson
        return s
    }

    /// テスト用Visit作成
    private func makeVisit(
        guestCount: Int = 2,
        setGuestCount: Int? = nil,
        nominations: [CastNomination] = [],
        douhanCastId: String? = nil,
        douhanQty: Int = 1,
        orderItems: [OrderItem] = [],
        setMinutes: Int = 60,
        extensionMinutes: Int = 0,
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
            extensionMinutes: extensionMinutes,
            setPriceOverride: setPriceOverride,
            nominationFeeOverrides: nominationFeeOverrides,
            douhanFeeOverride: douhanFeeOverride
        )
    }

    /// 60分 ¥5,000 / 90分 ¥7,000 / 120分 ¥9,000 のセットプラン
    private let defaultSetPlans: [SetPlan] = [
        SetPlan(id: "sp1", name: "60分", durationMinutes: 60, price: 5000, isActive: true),
        SetPlan(id: "sp2", name: "90分", durationMinutes: 90, price: 7000, isActive: true),
        SetPlan(id: "sp3", name: "120分", durationMinutes: 120, price: 9000, isActive: true),
    ]

    /// 金額比較ヘルパー（端数処理込み）
    private func assertYen(_ actual: Int, _ expected: Int, file: StaticString = #file, line: UInt = #line) {
        XCTAssertEqual(actual, expected, "期待: ¥\(expected) 実際: ¥\(actual)", file: file, line: line)
    }

    // MARK: - 1.4.2 基本セット料金テスト

    func test_基本セット料金_60分_2名() {
        let visit = makeVisit(guestCount: 2, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.setPrice, 10000) // 5000 × 2名
        assertYen(b.subtotal, 10000)
        assertYen(b.serviceFee, 4000) // floor(10000 × 0.4)
        assertYen(b.tax, 1400) // floor(14000 × 0.1)
        assertYen(b.chargedAmount, 15400) // 10000 + 4000 + 1400
    }

    func test_基本セット料金_90分() {
        let visit = makeVisit(guestCount: 1, setMinutes: 90)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.setPrice, 7000)
    }

    func test_基本セット料金_120分() {
        let visit = makeVisit(guestCount: 1, setMinutes: 120)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.setPrice, 9000)
    }

    func test_セット料金0円() {
        let visit = makeVisit(guestCount: 1, setMinutes: 45) // マッチしない
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.setPrice, 0)
        assertYen(b.chargedAmount, 0) // クラッシュしない
    }

    func test_セット料金高額_オーバーフローしない() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60, setPriceOverride: 1_000_000)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        XCTAssertTrue(b.chargedAmount > 0) // オーバーフローしない
        assertYen(b.setPrice, 1_000_000)
    }

    func test_setGuestCountが別指定() {
        let visit = makeVisit(guestCount: 3, setGuestCount: 2, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.setPrice, 10000) // 5000 × 2
    }

    // MARK: - 1.4.3 指名料テスト

    func test_本指名1人() {
        let nominations = [CastNomination(castId: "c1", nominationType: .main)]
        let visit = makeVisit(guestCount: 1, nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.nominationFees, 5000)
    }

    func test_場内指名1人() {
        let nominations = [CastNomination(castId: "c1", nominationType: .inStore)]
        let visit = makeVisit(guestCount: 1, nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.nominationFees, 2000)
    }

    func test_本指名と場内指名同時() {
        let nominations = [
            CastNomination(castId: "c1", nominationType: .main),
            CastNomination(castId: "c2", nominationType: .inStore),
        ]
        let visit = makeVisit(guestCount: 1, nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.nominationFees, 7000) // 5000 + 2000
    }

    func test_指名なし_0円() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.nominationFees, 0)
    }

    func test_指名なしタイプ_0円() {
        let nominations = [CastNomination(castId: "c1", nominationType: .none)]
        let visit = makeVisit(nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.nominationFees, 0)
    }

    func test_複数指名() {
        let nominations = [
            CastNomination(castId: "c1", nominationType: .main),
            CastNomination(castId: "c2", nominationType: .inStore),
            CastNomination(castId: "c3", nominationType: .main, qty: 2),
        ]
        let visit = makeVisit(nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.nominationFees, 17000) // 5000 + 2000 + 5000*2
    }

    func test_指名料上書き() {
        let nominations = [CastNomination(castId: "c1", nominationType: .main)]
        let visit = makeVisit(nominations: nominations, setMinutes: 60, nominationFeeOverrides: ["c1": 3000])
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.nominationFees, 3000)
    }

    // MARK: - 1.4.4 同伴料テスト

    func test_同伴料_0人_加算なし() {
        let visit = makeVisit(douhanCastId: nil, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.douhanFee, 0)
    }

    func test_同伴料_1人() {
        let visit = makeVisit(douhanCastId: "c1", douhanQty: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.douhanFee, 3000)
    }

    func test_同伴料_3人() {
        let visit = makeVisit(douhanCastId: "c1", douhanQty: 3, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.douhanFee, 9000) // 3000 × 3
    }

    func test_同伴料上書き() {
        let visit = makeVisit(douhanCastId: "c1", douhanQty: 1, setMinutes: 60, douhanFeeOverride: 5000)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.douhanFee, 5000)
    }

    // MARK: - 1.4.5 延長テスト

    func test_延長0回_加算なし() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60, extensionMinutes: 0)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        // 延長はorderItemsとして計上されるため、extensionMinutesだけでは加算されない
        assertYen(b.setPrice, 5000)
    }

    func test_延長1回_オーダーアイテムとして計上() {
        let extItem = OrderItem(menuItemId: "ext_1", menuItemName: "延長30分", price: 5000, quantity: 2)
        let visit = makeVisit(guestCount: 2, orderItems: [extItem], setMinutes: 60, extensionMinutes: 30)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.regularOrderTotal, 10000) // 5000 × 2名
    }

    func test_延長2回() {
        let items = [
            OrderItem(menuItemId: "ext_1", menuItemName: "延長30分", price: 5000, quantity: 2),
            OrderItem(menuItemId: "ext_2", menuItemName: "延長30分", price: 5000, quantity: 2),
        ]
        let visit = makeVisit(guestCount: 2, orderItems: items, setMinutes: 60, extensionMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.regularOrderTotal, 20000) // 5000 × 2名 × 2回
    }

    // MARK: - 1.4.6 割引テスト

    func test_金額割引_1000円引き() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let discount = DiscountInfo(amountDiscount: 1000, reason: "常連割引")
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, discountInfo: discount)
        assertYen(b.discount, 1000)
        assertYen(b.discountedSubtotal, 4000) // 5000 - 1000
    }

    func test_パーセント割引_10パーセント() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let discount = DiscountInfo(percentDiscount: 0.1)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, discountInfo: discount)
        assertYen(b.discount, 500) // floor(5000 × 0.1)
    }

    func test_割引でマイナスにならない() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let discount = DiscountInfo(amountDiscount: 100000)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, discountInfo: discount)
        assertYen(b.discountedSubtotal, 0) // max(0, ...)
        assertYen(b.chargedAmount, 0)
    }

    func test_金額割引とパーセント割引の同時適用() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        // 小計5000 → 金額1000引き → 4000 → 10%引き → 400
        let discount = DiscountInfo(amountDiscount: 1000, percentDiscount: 0.1)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, discountInfo: discount)
        assertYen(b.discount, 1400) // 1000 + floor(4000 × 0.1)
    }

    func test_割引0円_影響なし() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let discount = DiscountInfo(amountDiscount: 0, percentDiscount: 0)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, discountInfo: discount)
        assertYen(b.discount, 0)
    }

    // MARK: - 1.4.7 建て替えアイテムテスト

    func test_建て替え1個_サービス料税対象外() {
        let items = [
            OrderItem(menuItemId: "m2", menuItemName: "タクシー代", price: 3000, quantity: 1, isExpense: true),
        ]
        let visit = makeVisit(guestCount: 1, orderItems: items, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.expenseTotal, 3000)
        assertYen(b.subtotal, 5000) // セット料金のみ（建て替え含まない）
    }

    func test_建て替え複数() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "タクシー代", price: 3000, quantity: 1, isExpense: true),
            OrderItem(menuItemId: "m2", menuItemName: "花束", price: 5000, quantity: 1, isExpense: true),
        ]
        let visit = makeVisit(guestCount: 1, orderItems: items, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.expenseTotal, 8000) // 3000 + 5000
    }

    func test_通常アイテムと建て替え混在() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "ドリンク", price: 1000, quantity: 2),
            OrderItem(menuItemId: "m2", menuItemName: "タクシー代", price: 3000, quantity: 1, isExpense: true),
        ]
        let visit = makeVisit(guestCount: 1, orderItems: items, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.regularOrderTotal, 2000)
        assertYen(b.expenseTotal, 3000)
        assertYen(b.subtotal, 7000) // 5000 + 2000（建て替え含まない）
    }

    // MARK: - 1.4.8 複合テスト

    func test_全要素同時() {
        let settings = makeSettings()
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

        let discount = DiscountInfo(amountDiscount: 1000, reason: "テスト割引")
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: settings, discountInfo: discount)

        // セット: 5000 × 2 = 10000
        assertYen(b.setPrice, 10000)
        // 指名: 5000(本) + 2000(場内) = 7000
        assertYen(b.nominationFees, 7000)
        // 同伴: 3000
        assertYen(b.douhanFee, 3000)
        // ドリンク: 1000 × 3 = 3000
        assertYen(b.regularOrderTotal, 3000)
        // 建て替え: 5000
        assertYen(b.expenseTotal, 5000)
        // 小計: 10000 + 7000 + 3000 + 3000 = 23000
        assertYen(b.subtotal, 23000)
        // 割引: 1000
        assertYen(b.discount, 1000)
        // 割引後小計: 22000
        assertYen(b.discountedSubtotal, 22000)
        // サービス料: floor(22000 × 0.4) = 8800
        assertYen(b.serviceFee, 8800)
        // 税: floor((22000 + 8800) × 0.1) = floor(30800 × 0.1) = 3080
        assertYen(b.tax, 3080)
        // 課税後: 22000 + 8800 + 3080 = 33880
        assertYen(b.chargedAmount, 33880)

        // total = chargedAmount + expense = 33880 + 5000 = 38880
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 1000, settings: settings)
        assertYen(total, 38880)
    }

    func test_最小構成_セット料金のみ() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.setPrice, 5000)
        assertYen(b.nominationFees, 0)
        assertYen(b.douhanFee, 0)
        assertYen(b.regularOrderTotal, 0)
        assertYen(b.expenseTotal, 0)
        assertYen(b.discount, 0)
    }

    func test_税率0_サービス料0() {
        let settings = makeSettings(taxRate: 0, serviceRate: 0)
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: settings)
        assertYen(b.serviceFee, 0)
        assertYen(b.tax, 0)
        assertYen(b.chargedAmount, 5000) // 素の合計
    }

    func test_手動上書き() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(
            visit: visit, setPlans: defaultSetPlans,
            manualOverrideTotal: 10000
        )
        XCTAssertTrue(b.isManualOverride)
        assertYen(b.chargedAmount, 10000)
    }

    // MARK: - total() テスト

    func test_total_割引なし() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans)
        // セット5000, サービス2000, 税floor(7000*0.1)=700 → 7700
        assertYen(total, 7700)
    }

    func test_total_割引あり() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 1000)
        // 小計5000 - 割引1000 = 4000
        // サービス: floor(4000 × 0.4) = 1600
        // 税: floor((4000 + 1600) × 0.1) = floor(5600 × 0.1) = 560
        // total: 4000 + 1600 + 560 = 6160
        assertYen(total, 6160)
    }

    func test_total_割引が合計を超えてもマイナスにならない() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 100000)
        assertYen(total, 0)
    }

    func test_total_建て替えは割引後に加算() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "タクシー代", price: 2000, quantity: 1, isExpense: true),
        ]
        let visit = makeVisit(guestCount: 1, orderItems: items, setMinutes: 60)
        let total = PriceCalculator.total(visit: visit, setPlans: defaultSetPlans, discount: 100000)
        // max(0, chargedAmount - discount) + expense = 0 + 2000
        assertYen(total, 2000)
    }

    // MARK: - StoreSettings反映テスト

    func test_カスタム設定反映() {
        let settings = makeSettings(taxRate: 0.08, serviceRate: 0.3, nominationFeeMain: 8000)
        let nominations = [CastNomination(castId: "c1", nominationType: .main)]
        let visit = makeVisit(guestCount: 1, nominations: nominations, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: settings)

        assertYen(b.nominationFees, 8000)
        assertYen(b.subtotal, 13000) // 5000 + 8000
        assertYen(b.serviceFee, 3900) // floor(13000 × 0.3)
        // 税: floor((13000 + 3900) × 0.08) = floor(16900 × 0.08) = floor(1352) = 1352
        assertYen(b.tax, 1352)
    }

    func test_settings_nilはデフォルト値を使用() {
        let visit = makeVisit(guestCount: 1, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: nil)
        assertYen(b.serviceFee, 2000) // 5000 × 0.4
        // 税: floor((5000 + 2000) × 0.1) = 700
        assertYen(b.tax, 700)
    }

    // MARK: - 端数テスト

    func test_端数切り捨て() {
        let settings = makeSettings(taxRate: 0.1, serviceRate: 0.15)
        let visit = makeVisit(guestCount: 1, setMinutes: 60, setPriceOverride: 3333)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans, settings: settings)

        // サービス料: floor(3333 × 0.15) = floor(499.95) = 499
        assertYen(b.serviceFee, 499)
        // 税: floor((3333 + 499) × 0.1) = floor(3832 × 0.1) = floor(383.2) = 383
        assertYen(b.tax, 383)
    }

    // MARK: - setPriceOverrideテスト

    func test_setPriceOverride() {
        let visit = makeVisit(guestCount: 2, setMinutes: 60, setPriceOverride: 8000)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.setPrice, 8000)
    }

    // MARK: - オーダーテスト

    func test_通常オーダー() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "ドリンク", price: 1000, quantity: 2),
            OrderItem(menuItemId: "m2", menuItemName: "フード", price: 500, quantity: 1),
        ]
        let visit = makeVisit(orderItems: items, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.regularOrderTotal, 2500)
        assertYen(b.expenseTotal, 0)
    }

    func test_数量0のアイテムは除外() {
        let items = [
            OrderItem(menuItemId: "m1", menuItemName: "ドリンク", price: 1000, quantity: 0),
            OrderItem(menuItemId: "m2", menuItemName: "フード", price: 500, quantity: 1),
        ]
        let visit = makeVisit(orderItems: items, setMinutes: 60)
        let b = PriceCalculator.calculate(visit: visit, setPlans: defaultSetPlans)
        assertYen(b.regularOrderTotal, 500)
    }
}
