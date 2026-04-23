import SwiftUI

@main
struct LunaPOSApp: App {
    @State private var vm = AppViewModel()
    @AppStorage("lunaDarkMode") private var isDarkMode = true
    @State private var isAuthenticated = false
    @State private var isCheckingAuth = true
    @State private var showWelcome = false
    @State private var welcomeDeviceName = ""
    @State private var requiresUpdate = false

    var body: some Scene {
        WindowGroup {
            Group {
                if requiresUpdate {
                    ForceUpdateView()
                } else if isCheckingAuth {
                    splashView
                } else if showWelcome {
                    WelcomeView(deviceName: welcomeDeviceName) {
                        withAnimation(.easeInOut(duration: 0.4)) {
                            showWelcome = false
                            isAuthenticated = true
                        }
                    }
                } else if isAuthenticated {
                    ContentView()
                        .environment(vm)
                } else {
                    DeviceAuthView {
                        Task { await loadDataAndShow(isNewAuth: true) }
                    }
                }
            }
            .preferredColorScheme(isDarkMode ? .dark : .light)
            .task {
                await checkAuth()
            }
            .onReceive(NotificationCenter.default.publisher(for: .lunaDidLogout)) { _ in
                withAnimation(.easeInOut(duration: 0.3)) {
                    isAuthenticated = false
                    showWelcome = false
                    isCheckingAuth = false
                }
            }
        }
    }

    private func checkAuth() async {
        let success = await SupabaseService.shared.tryAutoLogin()
        if success {
            await loadDataAndShow(isNewAuth: false)
        } else {
            await MainActor.run {
                isCheckingAuth = false
            }
        }
    }

    @MainActor
    private func loadDataAndShow(isNewAuth: Bool) async {
        await vm.syncEngine.loadInitialData(into: vm)

        // バージョンチェック: storeSettings に minRequiredVersion があれば比較
        if let minVersion = vm.storeSettings.minRequiredVersion,
           isOutdated(current: currentAppVersion(), required: minVersion) {
            requiresUpdate = true
            isCheckingAuth = false
            return
        }

        isCheckingAuth = false

        if isNewAuth {
            // 初回認証時: ウェルカム画面を表示
            welcomeDeviceName = SupabaseService.shared.deviceName ?? "この端末"
            showWelcome = true
        } else {
            // 自動ログイン: 直接フロア画面へ
            isAuthenticated = true
        }
    }

    private func currentAppVersion() -> String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "0.0.0"
    }

    /// "1.2.3" 形式のバージョン文字列を比較。current < required なら true
    private func isOutdated(current: String, required: String) -> Bool {
        let toInts = { (v: String) in v.split(separator: ".").compactMap { Int($0) } }
        let cur = toInts(current)
        let req = toInts(required)
        for i in 0..<max(cur.count, req.count) {
            let c = i < cur.count ? cur[i] : 0
            let r = i < req.count ? req[i] : 0
            if c < r { return true }
            if c > r { return false }
        }
        return false
    }

    private var splashView: some View {
        ZStack {
            Color.lunaBg.ignoresSafeArea()
            VStack(spacing: 16) {
                Text("☽")
                    .font(.system(size: 56))
                Text("Luna POS")
                    .font(.system(size: 28, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(.lunaGold)
                ProgressView()
                    .tint(.lunaGold)
            }
        }
    }
}

// MARK: - 強制アップデート画面

struct ForceUpdateView: View {
    // App Store の Luna POS ページURL（リリース後に正式URLに差し替える）
    private let appStoreURL = URL(string: "https://apps.apple.com/jp/app/luna-pos/id0000000000")!

    var body: some View {
        ZStack {
            Color.lunaBg.ignoresSafeArea()
            VStack(spacing: 32) {
                Spacer()

                Image(systemName: "arrow.down.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.lunaGold)

                VStack(spacing: 12) {
                    Text("アップデートが必要です")
                        .font(.title.bold())
                        .foregroundStyle(.lunaText)

                    Text("このバージョンはサポートが終了しました。\nApp Store から最新版に更新してください。")
                        .font(.body)
                        .foregroundStyle(.lunaMuted)
                        .multilineTextAlignment(.center)
                }

                Button {
                    UIApplication.shared.open(appStoreURL)
                } label: {
                    Text("App Store を開く")
                        .font(.headline.bold())
                        .frame(maxWidth: 320)
                        .padding(.vertical, 18)
                        .foregroundStyle(.black)
                        .background(Color.lunaGold)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                Spacer()
            }
            .padding(.horizontal, 32)
        }
    }
}

// MARK: - ウェルカム画面

struct WelcomeView: View {
    let deviceName: String
    let onContinue: () -> Void

    @State private var appeared = false

    var body: some View {
        ZStack {
            Color.lunaBg.ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                // チェックマーク
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(.green)
                    .scaleEffect(appeared ? 1.0 : 0.3)
                    .opacity(appeared ? 1.0 : 0.0)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6), value: appeared)

                VStack(spacing: 12) {
                    Text("接続完了")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundStyle(.lunaText)

                    Text("「\(deviceName)」として登録されました")
                        .font(.system(size: 18))
                        .foregroundStyle(.lunaMuted)

                    Text("次回以降は自動でログインします")
                        .font(.system(size: 15))
                        .foregroundStyle(.lunaLight)
                }
                .opacity(appeared ? 1.0 : 0.0)
                .offset(y: appeared ? 0 : 20)
                .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)

                Spacer()

                Button {
                    onContinue()
                } label: {
                    Text("フロア画面へ")
                        .font(.system(size: 20, weight: .bold))
                        .frame(maxWidth: 360)
                        .padding(.vertical, 18)
                        .foregroundStyle(.white)
                        .background(Color.lunaDark)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .opacity(appeared ? 1.0 : 0.0)
                .animation(.easeOut(duration: 0.4).delay(0.6), value: appeared)

                Spacer().frame(height: 60)
            }
        }
        .onAppear {
            appeared = true
        }
    }
}
