import Foundation

/// Epson ePOS SDK ドライバ
/// SDK未導入時はスタブとして動作し、実機テスト時にSDKを差し込む
///
/// 対応予定機種: TM-m30III, TM-m30II, TM-T88VII 等
/// 接続方式: Bluetooth / Wi-Fi / USB
///
/// SDK導入手順:
/// 1. Epson ePOS SDK for iOS をダウンロード: https://download.ebz.epson.net/dsc/
/// 2. ePOS2.xcframework をプロジェクトに追加
/// 3. このファイルの #if EPSON_SDK_AVAILABLE ブロックを有効化
/// 4. Info.plist に NSBluetoothAlwaysUsageDescription を追加
/// 5. Info.plist に NSLocalNetworkUsageDescription を追加
final class EpsonPrintDriver: PrinterDriver, @unchecked Sendable {
    let printerType: PrinterType = .epson

    private var connectedPrinter: DiscoveredPrinter?

    func discover() async throws -> [DiscoveredPrinter] {
        #if EPSON_SDK_AVAILABLE
        return try await discoverWithSDK()
        #else
        throw PrinterError.sdkNotAvailable
        #endif
    }

    func connect(to printer: DiscoveredPrinter) async throws {
        #if EPSON_SDK_AVAILABLE
        try await connectWithSDK(printer)
        #else
        connectedPrinter = printer
        #endif
    }

    func disconnect() async {
        connectedPrinter = nil
    }

    func printReceipt(_ receipt: ReceiptData) async throws {
        guard connectedPrinter != nil else { throw PrinterError.notConnected }

        #if EPSON_SDK_AVAILABLE
        try await printWithSDK(receipt)
        #else
        throw PrinterError.sdkNotAvailable
        #endif
    }

    func testPrint() async throws {
        guard connectedPrinter != nil else { throw PrinterError.notConnected }

        #if EPSON_SDK_AVAILABLE
        try await testPrintWithSDK()
        #else
        throw PrinterError.sdkNotAvailable
        #endif
    }

    // MARK: - ESC/POS コマンド生成（SDK導入時に使用）

    /// Epson ePOS SDK の Epos2Printer コマンドビルダー用
    static func buildCommands(for receipt: ReceiptData) -> Data {
        var commands = Data()

        // ESC @ — 初期化
        commands.append(contentsOf: [0x1B, 0x40])

        // ESC a 1 — 中央揃え
        commands.append(contentsOf: [0x1B, 0x61, 0x01])

        let text = ReceiptFormatter.format(receipt)
        if let textData = text.data(using: .shiftJIS) ?? text.data(using: .utf8) {
            commands.append(textData)
        }

        // 紙送り + カット
        commands.append(contentsOf: [0x0A, 0x0A, 0x0A])
        // GS V 66 3 — パーシャルカット（Epson仕様）
        commands.append(contentsOf: [0x1D, 0x56, 0x42, 0x03])

        return commands
    }

    // MARK: - SDK統合用プレースホルダ

    #if EPSON_SDK_AVAILABLE
    /*
    import Epos2

    private var epos2Printer: Epos2Printer?

    private func discoverWithSDK() async throws -> [DiscoveredPrinter] {
        let discovery = Epos2Discovery()

        let filter = Epos2FilterOption()
        filter.deviceType = EPOS2_TYPE_PRINTER.rawValue

        return try await withCheckedThrowingContinuation { continuation in
            var printers: [DiscoveredPrinter] = []

            discovery.start(filter) { deviceInfo in
                guard let info = deviceInfo else { return }
                printers.append(DiscoveredPrinter(
                    id: info.target,
                    name: info.deviceName,
                    type: .epson,
                    connectionType: info.deviceType == EPOS2_DEVTYPE_TCP ? .wifi : .bluetooth
                ))
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
                discovery.stop()
                continuation.resume(returning: printers)
            }
        }
    }

    private func connectWithSDK(_ printer: DiscoveredPrinter) async throws {
        let p = Epos2Printer(printerSeries: EPOS2_TM_M30III.rawValue, lang: EPOS2_MODEL_JAPANESE.rawValue)
        let result = p?.connect(printer.id, timeout: 10000)
        guard result == EPOS2_SUCCESS.rawValue else {
            throw PrinterError.printFailed("Epson接続失敗: code \(result ?? -1)")
        }
        epos2Printer = p
        connectedPrinter = printer
    }

    private func printWithSDK(_ receipt: ReceiptData) async throws {
        guard let printer = epos2Printer else { throw PrinterError.notConnected }

        printer.clearCommandBuffer()

        let text = ReceiptFormatter.format(receipt)
        printer.addTextAlign(EPOS2_ALIGN_CENTER.rawValue)
        printer.addText(text)
        printer.addFeedLine(3)
        printer.addCut(EPOS2_CUT_FEED.rawValue)

        let result = printer.sendData(Int(EPOS2_PARAM_DEFAULT))
        guard result == EPOS2_SUCCESS.rawValue else {
            throw PrinterError.printFailed("Epson印刷失敗: code \(result)")
        }
    }
    */
    #endif
}
