import SwiftUI

/// SyncEngine のエラーメッセージ・オフライン状態を表示するバナー
struct ErrorBanner: View {
    let syncEngine: SyncEngine
    var onRetry: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            // オフラインバッジ（常時表示）
            if !syncEngine.isOnline {
                HStack(spacing: 6) {
                    Image(systemName: "wifi.slash")
                        .font(.system(size: 12, weight: .semibold))
                    Text("オフライン")
                        .font(.system(size: 12, weight: .semibold))
                    Spacer()
                    if let onRetry {
                        Button {
                            onRetry()
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "arrow.clockwise")
                                    .font(.system(size: 11, weight: .semibold))
                                Text("リトライ")
                                    .font(.system(size: 11, weight: .semibold))
                            }
                            .foregroundStyle(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.white.opacity(0.2))
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                        }
                    }
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.red.opacity(0.7))
            }

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
