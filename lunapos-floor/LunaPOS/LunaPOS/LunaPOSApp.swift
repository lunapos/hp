import SwiftUI

@main
struct LunaPOSApp: App {
    @State private var vm = AppViewModel()
    @AppStorage("lunaDarkMode") private var isDarkMode = true

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(vm)
                .preferredColorScheme(isDarkMode ? .dark : .light)
                .task {
                    // 開発用: テストテナントに直接接続
                    do {
                        try await SupabaseService.shared.authenticateForDev()
                        await vm.syncEngine.loadInitialData(into: vm)
                    } catch {
                        print("[LunaPOS] Supabase init failed: \(error)")
                    }
                }
        }
    }
}
