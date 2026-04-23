import Foundation
import UIKit

// MARK: - プリンタ種別

enum PrinterType: String, CaseIterable, Codable, Sendable {
    case airprint
    case star
    case epson

    var displayName: String {
        switch self {
        case .airprint: "AirPrint"
        case .star: "Star Micronics"
        case .epson: "Epson"
        }
    }

    var icon: String {
        switch self {
        case .airprint: "printer"
        case .star: "star.circle"
        case .epson: "printer.dotmatrix"
        }
    }
}

// MARK: - 検出されたプリンタ情報

struct DiscoveredPrinter: Identifiable, Sendable {
    let id: String
    let name: String
    let type: PrinterType
    let connectionType: PrinterConnectionType
}

enum PrinterConnectionType: String, Sendable {
    case bluetooth
    case wifi
    case usb
}

// MARK: - プリンタドライバプロトコル

protocol PrinterDriver: AnyObject, Sendable {
    var printerType: PrinterType { get }

    /// プリンタを検出
    func discover() async throws -> [DiscoveredPrinter]

    /// プリンタに接続
    func connect(to printer: DiscoveredPrinter) async throws

    /// 接続を切断
    func disconnect() async

    /// レシートを印刷
    func printReceipt(_ receipt: ReceiptData) async throws

    /// テスト印刷
    func testPrint() async throws
}

// MARK: - レシート→テキスト変換（80mm幅 = 48文字）

enum ReceiptFormatter {
    static let lineWidth = 48

    static func format(_ receipt: ReceiptData) -> String {
        var lines: [String] = []

        // 店名（中央揃え）
        lines.append(center(receipt.storeName))
        if let addr = receipt.storeAddress { lines.append(center(addr)) }
        if let phone = receipt.storePhone { lines.append(center("TEL: \(phone)")) }

        // インボイス登録番号
        if let reg = receipt.invoiceRegistrationNumber, !reg.isEmpty {
            lines.append(center("登録番号: \(reg)"))
        }

        lines.append(dashed())

        // 日時・テーブル・人数
        let dateStr = receipt.receiptDate.formatted(
            .dateTime.year().month().day().hour().minute()
        )
        lines.append(dateStr)
        if !receipt.tableName.isEmpty { lines.append("テーブル: \(receipt.tableName)") }
        lines.append("人数: \(receipt.guestCount)名")

        lines.append(dashed())

        // 明細ヘッダー
        lines.append(leftRight("品名", "金額"))
        lines.append(String(repeating: "-", count: lineWidth))

        // セット料金
        lines.append(itemLine(receipt.setPrice))

        // 延長
        for item in receipt.extensionItems { lines.append(itemLine(item)) }

        // 指名
        for item in receipt.nominationItems { lines.append(itemLine(item)) }

        // 同伴
        for item in receipt.douhanItems { lines.append(itemLine(item)) }

        // オーダー
        for item in receipt.orderItems { lines.append(itemLine(item)) }

        // 建て替え
        if !receipt.expenseItems.isEmpty {
            lines.append(String(repeating: "-", count: lineWidth))
            for item in receipt.expenseItems { lines.append(itemLine(item)) }
        }

        lines.append(dashed())

        // 金額サマリー
        lines.append(leftRight("小計", yen(receipt.subtotal)))
        lines.append(leftRight("サービス料", yen(receipt.serviceCharge)))
        let taxPercent = Int(receipt.taxRate * 100)
        lines.append(leftRight("消費税（\(taxPercent)%）", yen(receipt.taxAmount)))

        if receipt.discountAmount > 0 {
            lines.append(leftRight("割引", "−\(yen(receipt.discountAmount))"))
        }

        let expenseTotal = receipt.expenseItems.reduce(0) { $0 + $1.subtotal }
        if expenseTotal > 0 {
            lines.append(leftRight("建て替え計", yen(expenseTotal)))
        }

        lines.append(String(repeating: "=", count: lineWidth))
        lines.append(leftRight("合計", yen(receipt.totalAmount)))

        lines.append(dashed())

        // インボイス税率区分
        if receipt.invoiceRegistrationNumber != nil {
            lines.append(leftRight("\(taxPercent)%対象", yen(receipt.taxableAmount)))
            lines.append(leftRight("（内消費税）", yen(receipt.taxAmount)))
            lines.append(dashed())
        }

        // 支払い方法
        lines.append(leftRight("お支払い", receipt.paymentMethod))

        lines.append("")
        lines.append(center(receipt.footerMessage))
        lines.append(center("Luna Pos"))
        lines.append("")

        return lines.joined(separator: "\n")
    }

    // MARK: - ヘルパー

    private static func center(_ text: String) -> String {
        let pad = max(0, (lineWidth - text.count) / 2)
        return String(repeating: " ", count: pad) + text
    }

    private static func dashed() -> String {
        String(repeating: "-", count: lineWidth)
    }

    private static func leftRight(_ left: String, _ right: String) -> String {
        let space = max(1, lineWidth - left.count - right.count)
        return left + String(repeating: " ", count: space) + right
    }

    private static func yen(_ amount: Int) -> String {
        "¥\(amount.formatted())"
    }

    private static func itemLine(_ item: ReceiptData.ReceiptLineItem) -> String {
        let name: String
        if item.quantity > 1 {
            name = "\(item.name) ×\(item.quantity)"
        } else {
            name = item.name
        }
        let amount = item.isDiscount ? "−\(yen(abs(item.subtotal)))" : yen(item.subtotal)
        return leftRight(name, amount)
    }
}
