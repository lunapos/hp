import SwiftUI

// MARK: - 1.5.1 ネットワークステータスバッジ

/// ネットワーク接続状態を表示するバッジ
/// NetworkMonitor.isConnected == false の時に「オフライン」バッジを常時表示
struct NetworkStatusBadge: View {
    let networkMonitor: NetworkMonitor

    var body: some View {
        if !networkMonitor.isConnected {
            HStack(spacing: 6) {
                Image(systemName: "wifi.slash")
                    .font(.system(size: 12, weight: .semibold))
                Text("オフライン")
                    .font(.system(size: 12, weight: .semibold))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.red)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .transition(.opacity.animation(.easeOut(duration: 0.3)))
        }
    }
}

// MARK: - 1.5.2 同期ステータスバナー

/// 同期中・同期失敗状態を表示するバナー
struct SyncStatusBanner: View {
    let syncEngine: SyncEngine
    var onRetry: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            // 同期中表示
            if syncEngine.isSyncing {
                let progress = syncEngine.syncProgress
                HStack(spacing: 8) {
                    ProgressView()
                        .controlSize(.small)
                        .tint(.white)
                    Text("同期中... (\(progress.completed)/\(progress.total))")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white)
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.blue.opacity(0.7))
            }

            // 同期失敗表示（1.5.2）
            if syncEngine.syncFailedCount > 0 {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                    Text("同期に失敗したデータがあります")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white)

                    // 失敗レコード数バッジ
                    Text("\(syncEngine.syncFailedCount)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .clipShape(Capsule())

                    Spacer()

                    // リトライボタン（1.5.2）
                    Button {
                        syncEngine.retryFailed()
                        onRetry?()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 11, weight: .semibold))
                            Text("リトライ")
                                .font(.system(size: 11, weight: .semibold))
                        }
                        .foregroundStyle(.orange)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.orange.opacity(0.15))
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.orange.opacity(0.15))
            }
        }
    }
}

// MARK: - 1.5.4 エラー状態の統合管理

/// エラー状態を一元管理するObservableObject
@Observable
final class ErrorState {
    /// ネットワーク接続状態
    var isNetworkConnected: Bool { NetworkMonitor.shared.isConnected }

    /// 同期エンジンへの参照
    var syncEngine: SyncEngine?

    /// 最後のエラー（DB書き込み等）
    var lastError: String?

    /// エラー連続発生回数（1.5.3: 3回でサポート案内に切替）
    var consecutiveErrorCount = 0

    /// DB書き込みエラー表示フラグ（1.5.3）
    var showDBWriteError = false

    /// エラーメッセージ（1.5.3）
    var dbWriteErrorMessage: String {
        if consecutiveErrorCount >= 3 {
            return "サポートにお問い合わせください"
        }
        return "データの保存に失敗しました。もう一度お試しください。"
    }

    /// DB書き込みエラーを報告（1.5.3）
    func reportDBWriteError(_ error: Error) {
        consecutiveErrorCount += 1
        lastError = error.localizedDescription
        showDBWriteError = true
    }

    /// エラーをリセット（画面遷移時等）（1.5.4）
    func resetErrors() {
        lastError = nil
        showDBWriteError = false
        consecutiveErrorCount = 0
    }

    /// DB書き込みリトライ成功時
    func clearDBWriteError() {
        consecutiveErrorCount = 0
        showDBWriteError = false
        lastError = nil
    }
}

// MARK: - 1.5.3 DB書き込みエラーアラート修飾子

struct DBWriteErrorAlert: ViewModifier {
    @Bindable var errorState: ErrorState
    var onRetry: (() -> Void)?

    func body(content: Content) -> some View {
        content
            .alert("エラー", isPresented: $errorState.showDBWriteError) {
                if errorState.consecutiveErrorCount < 3 {
                    Button("リトライ") {
                        onRetry?()
                    }
                }
                Button("閉じる", role: .cancel) {}
            } message: {
                Text(errorState.dbWriteErrorMessage)
            }
    }
}

extension View {
    func dbWriteErrorAlert(errorState: ErrorState, onRetry: (() -> Void)? = nil) -> some View {
        modifier(DBWriteErrorAlert(errorState: errorState, onRetry: onRetry))
    }
}

// MARK: - 統合エラーバナー（既存のErrorBannerを改良）

/// SyncEngine のエラーメッセージ・オフライン状態を表示するバナー
struct ErrorBanner: View {
    let syncEngine: SyncEngine
    var onRetry: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            // オフラインバッジ（1.5.1）
            NetworkStatusBadge(networkMonitor: NetworkMonitor.shared)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16)
                .padding(.vertical, syncEngine.isOnline ? 0 : 4)

            // 同期ステータスバナー（1.5.2）
            SyncStatusBanner(syncEngine: syncEngine, onRetry: onRetry)

            // 同期エラーバナー
            if let error = syncEngine.lastSyncError {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.white)
                    Spacer()
                    if let onRetry {
                        Button {
                            onRetry()
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "arrow.clockwise")
                                    .font(.system(size: 11))
                                Text("リトライ")
                                    .font(.system(size: 11, weight: .semibold))
                            }
                            .foregroundStyle(.orange)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.orange.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                        }
                    }
                    Button {
                        syncEngine.clearError()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption2)
                            .foregroundStyle(.lunaMuted)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.orange.opacity(0.15))
            }
        }
    }
}
