import CoreBluetooth
import Foundation

/// CoreBluetooth を使ったBLEプリンター検出
/// Star / Epson の SDK が無くても近くのBLEデバイスを検出・接続できる
@Observable
final class BluetoothPrinterScanner: NSObject, @unchecked Sendable {
    static let shared = BluetoothPrinterScanner()

    private(set) var isScanning = false
    private(set) var bluetoothState: CBManagerState = .unknown
    private(set) var discoveredPeripherals: [BLEPrinter] = []

    private var centralManager: CBCentralManager!
    private var scanContinuation: CheckedContinuation<[DiscoveredPrinter], Error>?
    private var connectContinuation: CheckedContinuation<Void, Error>?
    private var connectedPeripheral: CBPeripheral?
    private var peripheralMap: [UUID: CBPeripheral] = [:]

    // レシートプリンターが使うBLEサービスUUID
    private static let printerServiceUUIDs: [CBUUID] = [
        CBUUID(string: "49535343-FE7D-4AE5-8FA9-9FAFD205E455"), // Star
        CBUUID(string: "000018F0-0000-1000-8000-00805F9B34FB"), // Epson BLE
    ]

    // プリンターメーカー名の部分一致キーワード
    private static let printerKeywords = [
        "star", "tsp", "mcp", "sm-l", "mprint", "sm-s",
        "epson", "tm-m", "tm-t", "tm-p",
        "printer", "receipt"
    ]

    private override init() {
        super.init()
        centralManager = CBCentralManager(delegate: nil, queue: .main)
        centralManager.delegate = self
    }

    /// BLEプリンターを検出（タイムアウト付き）
    func scan(timeout: TimeInterval = 8) async throws -> [DiscoveredPrinter] {
        guard bluetoothState == .poweredOn else {
            throw BluetoothError.bluetoothOff
        }
        guard !isScanning else {
            throw BluetoothError.alreadyScanning
        }

        discoveredPeripherals = []
        peripheralMap = [:]
        isScanning = true

        // サービスUUIDでフィルタしつつスキャン
        centralManager.scanForPeripherals(
            withServices: nil,
            options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
        )

        // タイムアウト後に結果を返す
        try await Task.sleep(for: .seconds(timeout))

        centralManager.stopScan()
        isScanning = false

        return discoveredPeripherals.map { $0.toDiscoveredPrinter() }
    }

    func stopScan() {
        centralManager.stopScan()
        isScanning = false
    }

    /// BLEデバイスに接続
    func connect(peripheralId: UUID) async throws {
        guard let peripheral = peripheralMap[peripheralId] else {
            throw BluetoothError.deviceNotFound
        }

        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            connectContinuation = cont
            centralManager.connect(peripheral, options: nil)

            // 10秒タイムアウト
            Task {
                try? await Task.sleep(for: .seconds(10))
                if connectContinuation != nil {
                    centralManager.cancelPeripheralConnection(peripheral)
                    connectContinuation?.resume(throwing: BluetoothError.connectionTimeout)
                    connectContinuation = nil
                }
            }
        }

        connectedPeripheral = peripheral
    }

    func disconnect() {
        if let peripheral = connectedPeripheral {
            centralManager.cancelPeripheralConnection(peripheral)
        }
        connectedPeripheral = nil
    }

    var isBluetoothAvailable: Bool {
        bluetoothState == .poweredOn
    }

    private func isPrinterLike(_ name: String) -> Bool {
        let lower = name.lowercased()
        return Self.printerKeywords.contains { lower.contains($0) }
    }
}

// MARK: - CBCentralManagerDelegate

extension BluetoothPrinterScanner: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        bluetoothState = central.state
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral,
                         advertisementData: [String: Any], rssi RSSI: NSNumber) {
        guard let name = peripheral.name ?? advertisementData[CBAdvertisementDataLocalNameKey] as? String,
              !name.isEmpty else { return }

        // プリンターっぽい名前か、既知のサービスUUIDを持っているか
        let serviceUUIDs = advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID] ?? []
        let hasKnownService = serviceUUIDs.contains { uuid in
            Self.printerServiceUUIDs.contains(uuid)
        }

        guard isPrinterLike(name) || hasKnownService else { return }

        let id = peripheral.identifier
        peripheralMap[id] = peripheral

        if !discoveredPeripherals.contains(where: { $0.id == id }) {
            let printerType = detectPrinterType(name: name, serviceUUIDs: serviceUUIDs)
            discoveredPeripherals.append(BLEPrinter(
                id: id,
                name: name,
                rssi: RSSI.intValue,
                printerType: printerType
            ))
        }
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        connectContinuation?.resume()
        connectContinuation = nil
    }

    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        connectContinuation?.resume(throwing: error ?? BluetoothError.connectionFailed)
        connectContinuation = nil
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        if peripheral.identifier == connectedPeripheral?.identifier {
            connectedPeripheral = nil
        }
    }

    private func detectPrinterType(name: String, serviceUUIDs: [CBUUID]) -> PrinterType {
        let lower = name.lowercased()
        if lower.contains("star") || lower.contains("tsp") || lower.contains("mcp")
            || lower.contains("sm-l") || lower.contains("sm-s") || lower.contains("mprint") {
            return .star
        }
        if lower.contains("epson") || lower.contains("tm-m") || lower.contains("tm-t") || lower.contains("tm-p") {
            return .epson
        }
        if serviceUUIDs.contains(CBUUID(string: "49535343-FE7D-4AE5-8FA9-9FAFD205E455")) {
            return .star
        }
        return .airprint
    }
}

// MARK: - モデル

struct BLEPrinter: Identifiable, Sendable {
    let id: UUID
    let name: String
    let rssi: Int
    let printerType: PrinterType

    func toDiscoveredPrinter() -> DiscoveredPrinter {
        DiscoveredPrinter(
            id: id.uuidString,
            name: name,
            type: printerType,
            connectionType: .bluetooth
        )
    }
}

enum BluetoothError: LocalizedError {
    case bluetoothOff
    case alreadyScanning
    case deviceNotFound
    case connectionFailed
    case connectionTimeout

    var errorDescription: String? {
        switch self {
        case .bluetoothOff: "Bluetoothがオフです。設定からオンにしてください"
        case .alreadyScanning: "スキャン中です"
        case .deviceNotFound: "デバイスが見つかりません"
        case .connectionFailed: "接続に失敗しました"
        case .connectionTimeout: "接続がタイムアウトしました"
        }
    }
}
