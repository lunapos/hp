import Foundation

/// Star Micronics ドライバ（StarIO10 SDK）
/// SDK未導入時はスタブとして動作し、実機テスト時にSDKを差し込む
///
/// 対応予定機種: TSP100IV, mC-Print3, SM-L200 等
/// 接続方式: Bluetooth / Wi-Fi / USB
///
/// SDK導入手順:
/// 1. StarIO10 SDK を SPM で追加: https://github.com/star-micronics/StarXpand-SDK-iOS
/// 2. このファイルの #if STAR_SDK_AVAILABLE ブロックを有効化
/// 3. Info.plist に NSBluetoothAlwaysUsageDescription を追加
/// 4. Info.plist に UISupportedExternalAccessoryProtocols を追加
final class StarPrintDriver: PrinterDriver, @unchecked Sendable {
    let printerType: PrinterType = .star

    private var connectedPrinter: DiscoveredPrinter?

    func discover() async throws -> [DiscoveredPrinter] {
        #if STAR_SDK_AVAILABLE
        // StarIO10 SDK での検出
        return try await discoverWithSDK()
        #else
        throw PrinterError.sdkNotAvailable
        #endif
    }

    func connect(to printer: DiscoveredPrinter) async throws {
        #if STAR_SDK_AVAILABLE
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

        #if STAR_SDK_AVAILABLE
        try await printWithSDK(receipt)
        #else
        throw PrinterError.sdkNotAvailable
        #endif
    }

    func testPrint() async throws {
        guard connectedPrinter != nil else { throw PrinterError.notConnected }

        #if STAR_SDK_AVAILABLE
        try await testPrintWithSDK()
        #else
        throw PrinterError.sdkNotAvailable
        #endif
    }

    // MARK: - ESC/POS コマンド生成（SDK導入時に使用）

    /// レシートデータからStarXpand Builderコマンドを生成
    /// SDK導入後、このメソッドの中身を StarXpand DocumentBuilder に置き換える
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
        // GS V 1 — パーシャルカット
        commands.append(contentsOf: [0x1D, 0x56, 0x01])

        return commands
    }

    // MARK: - SDK統合用プレースホルダ

    #if STAR_SDK_AVAILABLE
    /*
    import StarIO10

    private func discoverWithSDK() async throws -> [DiscoveredPrinter] {
        let manager = StarDeviceDiscoveryManagerFactory.create(
            interfaceTypes: [.bluetooth, .lan, .usb]
        )
        manager.discoveryTime = 5000

        return try await withCheckedThrowingContinuation { continuation in
            var printers: [DiscoveredPrinter] = []
            manager.delegate = DiscoveryDelegate { printer in
                printers.append(DiscoveredPrinter(
                    id: printer.connectionSettings.identifier,
                    name: printer.information?.model.rawValue ?? "Star Printer",
                    type: .star,
                    connectionType: printer.connectionSettings.interfaceType == .bluetooth ? .bluetooth : .wifi
                ))
            } onFinish: {
                continuation.resume(returning: printers)
            }
            do {
                try manager.startDiscovery()
            } catch {
                continuation.resume(throwing: PrinterError.discoveryFailed(error.localizedDescription))
            }
        }
    }

    private func connectWithSDK(_ printer: DiscoveredPrinter) async throws {
        let settings = StarConnectionSettings(interfaceType: .lan, identifier: printer.id)
        let starPrinter = StarPrinter(settings)
        try await starPrinter.open()
        connectedPrinter = printer
    }

    private func printWithSDK(_ receipt: ReceiptData) async throws {
        let builder = StarXpandCommand.StarXpandCommandBuilder()
        let docBuilder = StarXpandCommand.DocumentBuilder()
        let printerBuilder = StarXpandCommand.PrinterBuilder()

        let text = ReceiptFormatter.format(receipt)
        printerBuilder.actionPrintText(text)
        printerBuilder.actionCut(.partial)

        docBuilder.addPrinter(printerBuilder)
        builder.addDocument(docBuilder)

        let commands = builder.getCommands()
        // send to printer...
    }
    */
    #endif
}
