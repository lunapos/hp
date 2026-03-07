import Foundation
import Network
import OSLog

private let logger = Logger(subsystem: "com.luna.pos", category: "NetworkMonitor")

/// ネットワーク接続状態の種類（1.2.2）
enum ConnectionType: String, Sendable {
    case wifi
    case cellular
    case unknown
}

/// ネットワーク監視クラス（1.2.2）
/// NWPathMonitorをラップし、接続状態をPublishedプロパティで公開
@Observable
final class NetworkMonitor: @unchecked Sendable {
    static let shared = NetworkMonitor()

    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "luna.network.monitor")

    /// 接続状態（1.2.2）
    private(set) var isConnected: Bool = false

    /// 接続タイプ（1.2.2）
    private(set) var connectionType: ConnectionType = .unknown

    /// ネットワーク復旧通知名（1.2.2）
    static let networkRestoredNotification = Notification.Name("luna.networkRestored")

    private var wasConnected = false

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            guard let self else { return }
            let connected = path.status == .satisfied
            let type: ConnectionType
            if path.usesInterfaceType(.wifi) {
                type = .wifi
            } else if path.usesInterfaceType(.cellular) {
                type = .cellular
            } else {
                type = .unknown
            }

            DispatchQueue.main.async { [weak self] in
                guard let self else { return }
                let previouslyConnected = self.wasConnected
                self.isConnected = connected
                self.connectionType = type

                // ネットワーク復旧時に通知を発火（1.2.2）
                if connected && !previouslyConnected {
                    logger.info("ネットワーク復旧 — .networkRestored 通知を発火")
                    NotificationCenter.default.post(name: NetworkMonitor.networkRestoredNotification, object: nil)
                }
                self.wasConnected = connected
            }
        }
        monitor.start(queue: monitorQueue)
        logger.info("ネットワーク監視を開始")
    }

    deinit {
        monitor.cancel()
        logger.info("ネットワーク監視を停止")
    }
}
