import Foundation

/// レシートデータモデル（2.5.1）
/// 80mm幅レシートプリンタ向けレイアウト
struct ReceiptData: Codable, Sendable {
    let storeName: String
    let storeAddress: String?
    let storePhone: String?
    let receiptDate: Date
    let tableName: String
    let customerName: String?
    let guestCount: Int

    // 明細
    let setPrice: ReceiptLineItem
    let extensionItems: [ReceiptLineItem]
    let nominationItems: [ReceiptLineItem]
    let douhanItems: [ReceiptLineItem]
    let orderItems: [ReceiptLineItem]
    let expenseItems: [ReceiptLineItem] // 建て替え

    // 合計
    let subtotal: Int         // 小計
    let serviceCharge: Int    // サービス料
    let taxAmount: Int        // 消費税
    let discountAmount: Int   // 割引
    let totalAmount: Int      // 合計

    // 支払い
    let paymentMethod: String
    let cashAmount: Int?      // カード・現金混合払い用
    let cardAmount: Int?

    // インボイス（2.6.2）
    let invoiceRegistrationNumber: String?
    let taxRate: Double       // 税率（10%）
    let taxableAmount: Int    // 課税対象額

    // フッター
    let footerMessage: String

    /// 明細行
    struct ReceiptLineItem: Codable, Sendable {
        let name: String
        let quantity: Int
        let unitPrice: Int
        let subtotal: Int
        let isDiscount: Bool

        init(name: String, quantity: Int = 1, unitPrice: Int, isDiscount: Bool = false) {
            self.name = name
            self.quantity = quantity
            self.unitPrice = unitPrice
            self.subtotal = isDiscount ? -abs(unitPrice * quantity) : unitPrice * quantity
            self.isDiscount = isDiscount
        }
    }

    /// PaymentからReceiptDataを生成
    static func from(
        payment: Payment,
        visit: Visit,
        breakdown: PriceCalculator.Breakdown,
        settings: StoreSettings,
        storeName: String = "Luna POS",
        storeAddress: String? = nil,
        storePhone: String? = nil,
        casts: [Cast] = [],
        footerMessage: String = "ご来店ありがとうございました"
    ) -> ReceiptData {
        // セット料金行
        let setLine = ReceiptLineItem(
            name: "セット料金(\(visit.setMinutes)分)",
            quantity: visit.setGuestCount,
            unitPrice: breakdown.setPrice / max(1, visit.setGuestCount)
        )

        // 延長行
        let extItems = visit.orderItems
            .filter { $0.menuItemId.hasPrefix("ext_") }
            .map { ReceiptLineItem(name: $0.menuItemName, quantity: $0.quantity, unitPrice: $0.price) }

        // 指名行
        let nomItems = visit.nominations.compactMap { nom -> ReceiptLineItem? in
            guard nom.nominationType != .none else { return nil }
            let castName = casts.first(where: { $0.id == nom.castId })?.stageName ?? ""
            let typeName = nom.nominationType == .main ? "本指名" : "場内指名"
            let fee = PriceCalculator.nominationFee(for: nom, overrides: visit.nominationFeeOverrides, settings: settings)
            return ReceiptLineItem(name: "\(typeName)(\(castName))", quantity: nom.qty, unitPrice: fee)
        }

        // 同伴行
        var douhanItems: [ReceiptLineItem] = []
        if let douhanId = visit.douhanCastId {
            let castName = casts.first(where: { $0.id == douhanId })?.stageName ?? ""
            douhanItems.append(ReceiptLineItem(
                name: "同伴(\(castName))",
                quantity: visit.douhanQty,
                unitPrice: visit.douhanFeeOverride ?? settings.douhanFee
            ))
        }

        // オーダー行（建て替え除外）
        let orderLines = visit.orderItems
            .filter { !$0.isExpense && !$0.menuItemId.hasPrefix("ext_") && $0.quantity > 0 }
            .map { ReceiptLineItem(name: $0.menuItemName, quantity: $0.quantity, unitPrice: $0.price) }

        // 建て替え行
        let expenseLines = visit.orderItems
            .filter { $0.isExpense && $0.quantity > 0 }
            .map { ReceiptLineItem(name: "\($0.menuItemName)(建替)", quantity: $0.quantity, unitPrice: $0.price) }

        return ReceiptData(
            storeName: storeName,
            storeAddress: storeAddress,
            storePhone: storePhone,
            receiptDate: payment.paidAt,
            tableName: "", // 呼び出し元で設定
            customerName: payment.customerName,
            guestCount: visit.guestCount,
            setPrice: setLine,
            extensionItems: extItems,
            nominationItems: nomItems,
            douhanItems: douhanItems,
            orderItems: orderLines,
            expenseItems: expenseLines,
            subtotal: breakdown.subtotal,
            serviceCharge: breakdown.serviceFee,
            taxAmount: breakdown.tax,
            discountAmount: payment.discount,
            totalAmount: payment.total,
            paymentMethod: payment.paymentMethod.label,
            cashAmount: nil,
            cardAmount: nil,
            invoiceRegistrationNumber: settings.invoiceRegistrationNumber,
            taxRate: settings.taxRate,
            taxableAmount: breakdown.discountedSubtotal + breakdown.serviceFee,
            footerMessage: footerMessage
        )
    }
}

/// プリンタ接続状態（2.5.2）
enum PrinterConnectionState: String, Sendable {
    case disconnected
    case searching
    case connected
    case printing
    case error
}

/// プリンタマネージャー（2.5.2 — Epson ePOS SDKのスタブ）
/// 実際のSDK統合は実機テスト時に行う
@Observable
final class PrinterManager: @unchecked Sendable {
    static let shared = PrinterManager()

    private(set) var connectionState: PrinterConnectionState = .disconnected
    private(set) var lastError: String?

    /// 選択中のプリンタ名（UserDefaultsで永続化）
    var selectedPrinter: String? {
        get { UserDefaults.standard.string(forKey: "luna_selected_printer") }
        set { UserDefaults.standard.set(newValue, forKey: "luna_selected_printer") }
    }

    /// 印刷キュー（2.5.3）
    private var printQueue: [ReceiptData] = []
    private var isPrinting = false

    private init() {}

    /// レシート印刷（2.5.3）
    func print(receipt: ReceiptData) async throws {
        printQueue.append(receipt)
        await processPrintQueue()
    }

    /// 印刷キューを処理（2.5.3）
    private func processPrintQueue() async {
        guard !isPrinting, !printQueue.isEmpty else { return }
        isPrinting = true
        defer { isPrinting = false }

        while let receipt = printQueue.first {
            printQueue.removeFirst()
            // 実際の印刷処理はEpson ePOS SDK統合時に実装
            // 現時点ではPDF出力のスタブ
            connectionState = .printing
            try? await Task.sleep(for: .milliseconds(100))
            connectionState = .connected
        }
    }

    /// テスト印刷（2.5.2）
    func testPrint() async {
        connectionState = .printing
        try? await Task.sleep(for: .seconds(1))
        connectionState = .connected
    }
}
