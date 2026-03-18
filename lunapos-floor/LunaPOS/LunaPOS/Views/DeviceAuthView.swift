import SwiftUI

/// デバイストークン入力画面（初回セットアップ時に1回だけ表示）
struct DeviceAuthView: View {
    let onAuthenticated: () -> Void

    @State private var token = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @FocusState private var isFocused: Bool

    var body: some View {
        ZStack {
            Color.lunaBg.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // ロゴ
                VStack(spacing: 12) {
                    Text("☽")
                        .font(.system(size: 64))
                    Text("Luna POS")
                        .font(.system(size: 32, weight: .bold))
                        .tracking(2)
                        .foregroundStyle(.lunaGold)
                    Text("端末セットアップ")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(.lunaMuted)
                }

                Spacer().frame(height: 48)

                // 入力フォーム
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("デバイストークン")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(.lunaMuted)

                        TextField("トークンを入力", text: $token)
                            .font(.system(size: 20, weight: .medium, design: .monospaced))
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .padding(16)
                            .background(Color.lunaCard)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(errorMessage != nil ? Color.red.opacity(0.6) : Color.lunaBorder)
                            )
                            .focused($isFocused)
                    }

                    if let error = errorMessage {
                        HStack(spacing: 6) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(.red)
                            Text(error)
                                .font(.system(size: 14))
                                .foregroundStyle(.red)
                        }
                        .transition(.opacity)
                    }

                    Button {
                        authenticate()
                    } label: {
                        Group {
                            if isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("接続する")
                                    .font(.system(size: 18, weight: .bold))
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .foregroundStyle(.white)
                        .background(token.isEmpty ? Color.lunaDarkLight : Color.lunaDark)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(token.isEmpty || isLoading)
                }
                .frame(maxWidth: 420)

                Spacer().frame(height: 32)

                // 説明
                VStack(spacing: 8) {
                    Text("トークンはLuna管理画面で発行できます")
                        .font(.system(size: 13))
                        .foregroundStyle(.lunaLight)
                    Text("一度設定すれば、次回以降は自動でログインします")
                        .font(.system(size: 13))
                        .foregroundStyle(.lunaLight)
                }

                Spacer()
            }
            .padding(.horizontal, 40)
        }
        .onAppear {
            isFocused = true
        }
    }

    private func authenticate() {
        let trimmed = token.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                try await SupabaseService.shared.authenticateDevice(deviceToken: trimmed)
                await MainActor.run {
                    onAuthenticated()
                }
            } catch let error as SupabaseError {
                await MainActor.run {
                    isLoading = false
                    switch error {
                    case .authError:
                        errorMessage = "無効なトークンです。トークンを確認してください。"
                    case .networkError:
                        errorMessage = "ネットワークに接続できません。Wi-Fiを確認してください。"
                    default:
                        errorMessage = "接続に失敗しました。しばらくしてからお試しください。"
                    }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "接続に失敗しました。しばらくしてからお試しください。"
                }
            }
        }
    }
}
