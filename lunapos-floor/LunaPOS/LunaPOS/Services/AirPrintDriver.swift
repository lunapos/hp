import UIKit

/// AirPrint ドライバ — iPad標準のAirPrint対応プリンターで印刷
/// SDK不要、UIPrintInteractionController でPDFレンダリング→印刷
final class AirPrintDriver: PrinterDriver, @unchecked Sendable {
    let printerType: PrinterType = .airprint

    private var selectedPrinterURL: URL?

    func discover() async throws -> [DiscoveredPrinter] {
        // AirPrintはシステムが自動検出するため、ダミーエントリを返す
        [DiscoveredPrinter(
            id: "airprint-system",
            name: "AirPrint（システム選択）",
            type: .airprint,
            connectionType: .wifi
        )]
    }

    func connect(to printer: DiscoveredPrinter) async throws {
        // AirPrintは印刷時にシステムダイアログで選択するため接続不要
    }

    func disconnect() async {
        selectedPrinterURL = nil
    }

    func printReceipt(_ receipt: ReceiptData) async throws {
        let pdfData = renderReceiptPDF(receipt)
        try await printPDF(pdfData)
    }

    func testPrint() async throws {
        let testText = """
        ================================
                 テスト印刷
                 Luna Pos
        ================================

        プリンター接続テスト
        日時: \(Date().formatted(.dateTime.year().month().day().hour().minute()))

        このレシートが正常に印刷されていれば
        プリンターは正しく設定されています。

        ================================
        """
        let pdfData = renderTextPDF(testText)
        try await printPDF(pdfData)
    }

    // MARK: - PDF レンダリング

    /// レシートデータを80mm幅PDFにレンダリング
    private func renderReceiptPDF(_ receipt: ReceiptData) -> Data {
        let text = ReceiptFormatter.format(receipt)
        return renderTextPDF(text)
    }

    /// テキストを80mm幅のPDFにレンダリング
    private func renderTextPDF(_ text: String) -> Data {
        // 80mm = 226pt（72dpi換算）、高さは内容に応じて可変
        let pageWidth: CGFloat = 226
        let margin: CGFloat = 8
        let contentWidth = pageWidth - margin * 2

        let font = UIFont.monospacedSystemFont(ofSize: 8, weight: .regular)
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = 2

        let attributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: UIColor.black,
            .paragraphStyle: paragraphStyle
        ]

        let attrString = NSAttributedString(string: text, attributes: attributes)
        let textSize = attrString.boundingRect(
            with: CGSize(width: contentWidth, height: .greatestFiniteMagnitude),
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            context: nil
        )

        let pageHeight = textSize.height + margin * 2 + 20 // 余白
        let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)

        let renderer = UIGraphicsPDFRenderer(bounds: pageRect)
        return renderer.pdfData { context in
            context.beginPage()
            let drawRect = CGRect(x: margin, y: margin, width: contentWidth, height: textSize.height + 10)
            attrString.draw(in: drawRect)
        }
    }

    // MARK: - 印刷実行

    @MainActor
    private func printPDF(_ data: Data) async throws {
        let controller = UIPrintInteractionController.shared
        let printInfo = UIPrintInfo.printInfo()
        printInfo.jobName = "Luna Pos レシート"
        printInfo.outputType = .general
        controller.printInfo = printInfo
        controller.printingItem = data

        if let printerURL = selectedPrinterURL {
            let printer = UIPrinter(url: printerURL)
            controller.print(to: printer, completionHandler: nil)
        } else {
            try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                controller.present(animated: true) { _, completed, error in
                    if let error {
                        continuation.resume(throwing: error)
                    } else if !completed {
                        continuation.resume(throwing: PrinterError.cancelled)
                    } else {
                        continuation.resume()
                    }
                }
            }
        }
    }
}

enum PrinterError: LocalizedError {
    case cancelled
    case notConnected
    case sdkNotAvailable
    case discoveryFailed(String)
    case printFailed(String)

    var errorDescription: String? {
        switch self {
        case .cancelled: "印刷がキャンセルされました"
        case .notConnected: "プリンターが接続されていません"
        case .sdkNotAvailable: "プリンターSDKが利用できません（実機で確認してください）"
        case .discoveryFailed(let msg): "プリンター検出に失敗: \(msg)"
        case .printFailed(let msg): "印刷に失敗: \(msg)"
        }
    }
}
