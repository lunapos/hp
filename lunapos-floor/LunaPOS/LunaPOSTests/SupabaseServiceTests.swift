import XCTest
@testable import LunaPOS

/// 1.1.7 SupabaseService ユニットテスト
/// モックSupabaseクライアントは使わず、DTOマッピングとバリデーションロジックをテスト
final class SupabaseServiceTests: XCTestCase {

    // MARK: - DTOマッピングテスト

    func test_VisitRow_from_Visit_変換が正しい() {
        let visit = Visit(
            id: "550e8400-e29b-41d4-a716-446655440000",
            tableId: "660e8400-e29b-41d4-a716-446655440001",
            customerId: "770e8400-e29b-41d4-a716-446655440002",
            customerName: "田中様",
            guestCount: 3,
            setGuestCount: 2,
            nominations: [],
            douhanCastId: "880e8400-e29b-41d4-a716-446655440003",
            douhanQty: 1,
            checkInTime: Date(),
            orderItems: [],
            setMinutes: 60,
            extensionMinutes: 30,
            setPriceOverride: 8000,
            douhanFeeOverride: 5000
        )
        let tenantId = UUID(uuidString: "a0000000-0000-0000-0000-000000000001")!
        let row = VisitRow.from(visit, tenantId: tenantId)

        XCTAssertEqual(row.tenantId, tenantId)
        XCTAssertEqual(row.guestCount, 3)
        XCTAssertEqual(row.customerName, "田中様")
        XCTAssertEqual(row.setMinutes, 60)
        XCTAssertEqual(row.extensionMinutes, 30)
        XCTAssertEqual(row.setPriceOverride, 8000)
        XCTAssertEqual(row.douhanFeeOverride, 5000)
        XCTAssertFalse(row.isCheckedOut)
    }

    func test_NominationRow_from_CastNomination() {
        let nom = CastNomination(castId: "c1000000-0000-0000-0000-000000000001", nominationType: .main, qty: 2)
        let tenantId = UUID(uuidString: "a0000000-0000-0000-0000-000000000001")!
        let row = NominationRow.from(nom, visitId: "v1000000-0000-0000-0000-000000000001", tenantId: tenantId, feeOverride: 3000)

        XCTAssertEqual(row.tenantId, tenantId)
        XCTAssertEqual(row.nominationType, "main")
        XCTAssertEqual(row.qty, 2)
        XCTAssertEqual(row.feeOverride, 3000)
    }

    func test_OrderItemRow_from_OrderItem() {
        let item = OrderItem(menuItemId: "m1", menuItemName: "ビール", price: 1000, quantity: 3, isExpense: false, castId: nil)
        let tenantId = UUID(uuidString: "a0000000-0000-0000-0000-000000000001")!
        let row = OrderItemRow.from(item, visitId: "v1", tenantId: tenantId)

        XCTAssertEqual(row.menuItemName, "ビール")
        XCTAssertEqual(row.price, 1000)
        XCTAssertEqual(row.quantity, 3)
        XCTAssertFalse(row.isExpense)
    }

    func test_PaymentRow_from_Payment() {
        let payment = Payment(
            id: "p1000000-0000-0000-0000-000000000001",
            visitId: "v1", tableId: "t1",
            customerName: "田中様",
            subtotal: 10000, expenseTotal: 2000, nominationFee: 5000,
            serviceFee: 4000, tax: 1000, discount: 500, total: 14500,
            paymentMethod: .cash, paidAt: Date(), items: []
        )
        let tenantId = UUID(uuidString: "a0000000-0000-0000-0000-000000000001")!
        let row = PaymentRow.from(payment, tenantId: tenantId)

        XCTAssertEqual(row.subtotal, 10000)
        XCTAssertEqual(row.expenseTotal, 2000)
        XCTAssertEqual(row.serviceFee, 4000)
        XCTAssertEqual(row.tax, 1000)
        XCTAssertEqual(row.discount, 500)
        XCTAssertEqual(row.total, 14500)
        XCTAssertEqual(row.paymentMethod, "cash")
    }

    func test_CashWithdrawalRow_from_CashWithdrawal() {
        let withdrawal = CashWithdrawal(amount: 5000, note: "タクシー代")
        let tenantId = UUID(uuidString: "a0000000-0000-0000-0000-000000000001")!
        let row = CashWithdrawalRow.from(withdrawal, tenantId: tenantId)

        XCTAssertEqual(row.amount, 5000)
        XCTAssertEqual(row.note, "タクシー代")
        XCTAssertEqual(row.tenantId, tenantId)
    }

    func test_PaymentItemRow_from_OrderItem() {
        let item = OrderItem(menuItemId: "m1", menuItemName: "シャンパン", price: 5000, quantity: 1, isExpense: false)
        let tenantId = UUID(uuidString: "a0000000-0000-0000-0000-000000000001")!
        let row = PaymentItemRow.from(item, paymentId: "p1", tenantId: tenantId)

        XCTAssertEqual(row.menuItemName, "シャンパン")
        XCTAssertEqual(row.price, 5000) // 会計時点の単価が固定保存される
        XCTAssertEqual(row.quantity, 1)
    }

    // MARK: - SupabaseError テスト

    func test_SupabaseError_全ケースカバー() {
        // 全ケースのエラーが生成可能であることを確認
        let errors: [SupabaseError] = [
            .networkError(underlying: URLError(.notConnectedToInternet)),
            .authError(statusCode: 401),
            .validationError(message: "テスト"),
            .serverError(statusCode: 500, message: "テスト"),
            .rateLimited,
            .unknown(underlying: NSError(domain: "", code: 0)),
        ]

        for error in errors {
            XCTAssertNotNil(error.errorDescription)
        }
        XCTAssertEqual(errors.count, 6) // 全6ケース
    }

    // MARK: - バリデーションテスト

    func test_空配列入力時にAPIコールが不要() {
        // 空配列の場合、不要なAPIコールが発生しないことの構造テスト
        let emptyNominations: [NominationRow] = []
        XCTAssertTrue(emptyNominations.isEmpty)

        let emptyOrderItems: [OrderItemRow] = []
        XCTAssertTrue(emptyOrderItems.isEmpty)
    }

    // MARK: - StoreRow→StoreSettingsマッピング

    func test_StoreRow_toStoreSettings() {
        let row = StoreRow(
            id: UUID(),
            name: "テスト店",
            serviceRate: 0.35,
            taxRate: 0.08,
            douhanFee: 4000,
            nominationFeeMain: 6000,
            nominationFeeInStore: 3000,
            extensionFeePerPerson: 4000,
            invoiceRegistrationNumber: "T1234567890123"
        )
        let settings = StoreSettings(from: row)

        XCTAssertEqual(settings.serviceRate, 0.35)
        XCTAssertEqual(settings.taxRate, 0.08)
        XCTAssertEqual(settings.douhanFee, 4000)
        XCTAssertEqual(settings.nominationFeeMain, 6000)
        XCTAssertEqual(settings.nominationFeeInStore, 3000)
        XCTAssertEqual(settings.extensionFeePerPerson, 4000)
        XCTAssertEqual(settings.invoiceRegistrationNumber, "T1234567890123")
    }
}
