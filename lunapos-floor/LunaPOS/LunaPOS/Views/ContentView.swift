import SwiftUI

enum AppScreen: Hashable {
    case floor
    case cast
}

struct ContentView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var selectedTableId: String?
    @State private var showCheckout = false
    @State private var path = NavigationPath()
    @AppStorage("lunaDarkMode") private var isDarkMode = true
    @State private var isSyncing = false
    @State private var showRegister = false
    @State private var showLogoutConfirm = false
    @State private var showPrinterSettings = false

    var body: some View {
        NavigationStack(path: $path) {
            mainFloorView
                .navigationDestination(for: AppScreen.self) { screen in
                    switch screen {
                    case .floor:
                        mainFloorView
                    case .cast:
                        CastView()
                            .environment(vm)
                    }
                }
        }
        .environment(vm)
        .onChange(of: selectedTableId) { _, newValue in
            // When a table is selected, we handle it via sheet/fullscreen
        }
        .fullScreenCover(item: $selectedTableId) { tableId in
            NavigationStack {
                if showCheckout {
                    CheckoutView(
                        tableId: tableId,
                        selectedTableId: $selectedTableId,
                        showCheckout: $showCheckout
                    )
                    .environment(vm)
                } else {
                    TableDetailView(
                        tableId: tableId,
                        showCheckout: $showCheckout,
                        selectedTableId: $selectedTableId
                    )
                    .environment(vm)
                }
            }
        }
        .sheet(isPresented: $showRegister) {
            NavigationStack {
                ScrollView {
                    RegisterTabView()
                }
                .background(Color.lunaBg)
                .navigationTitle("レジ締め")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("閉じる") { showRegister = false }
                    }
                }
                .toolbarBackground(Color.lunaDark, for: .navigationBar)
                .toolbarBackground(.visible, for: .navigationBar)
                .toolbarColorScheme(.dark, for: .navigationBar)
            }
            .environment(vm)
        }
        .sheet(isPresented: $showPrinterSettings) {
            PrinterSettingsView()
        }
        .alert("ログアウトしますか？", isPresented: $showLogoutConfirm) {
            Button("ログアウト", role: .destructive) {
                SupabaseService.shared.logout()
                NotificationCenter.default.post(name: .lunaDidLogout, object: nil)
            }
            Button("キャンセル", role: .cancel) {}
        } message: {
            Text("再度使用するにはデバイストークンの入力が必要です")
        }
    }

    @ViewBuilder
    private var mainFloorView: some View {
        VStack(spacing: 0) {
            customHeaderBar
            // 同期エラー・オフラインバナー
            ErrorBanner(syncEngine: vm.syncEngine) {
                Task {
                    await vm.syncEngine.loadInitialData(into: vm)
                }
            }
            FloorView(
                selectedTableId: $selectedTableId,
                showCheckout: $showCheckout
            )
            .environment(vm)
        }
        .navigationBarHidden(true)
    }

    private var customHeaderBar: some View {
        HStack(spacing: 0) {
            // Left: Luna POS logo + sync
            Button {
                guard !isSyncing else { return }
                isSyncing = true
                Task {
                    await vm.syncEngine.loadInitialData(into: vm)
                    isSyncing = false
                }
            } label: {
                HStack(spacing: 8) {
                    if isSyncing {
                        ProgressView()
                            .controlSize(.regular)
                            .tint(.lunaGold)
                    }
                    Text("☽ Luna POS")
                        .font(.system(size: 20, weight: .bold))
                        .tracking(1)
                        .foregroundStyle(.lunaGold)
                }
                .frame(minHeight: 48)
                .contentShape(Rectangle())
            }

            Spacer()

            // Center: Today's sales
            HStack(spacing: 10) {
                Text("本日売上")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.lunaSubtle)
                Text(vm.totalSales.yenFormatted)
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundStyle(.lunaGold)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 10)
            .background(Color.lunaGold.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 12))

            Spacer()

            // Right: Action buttons
            HStack(spacing: 16) {
                headerButton("キャスト", icon: "person.badge.clock", color: .white) {
                    path.append(AppScreen.cast)
                }
                headerButton("レジ", icon: "yensign.circle", color: .white) {
                    showRegister = true
                }
                headerButton("プリンタ", icon: "printer", color: .white) {
                    showPrinterSettings = true
                }
                headerButton("ログアウト", icon: "rectangle.portrait.and.arrow.right", color: .red.opacity(0.8)) {
                    showLogoutConfirm = true
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.lunaDark)
    }

    private func headerButton(_ label: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 26))
                Text(label)
                    .font(.system(size: 12, weight: .semibold))
            }
            .foregroundStyle(color)
            .frame(minWidth: 64, minHeight: 56)
            .contentShape(Rectangle())
        }
    }
}

extension String: @retroactive Identifiable {
    public var id: String { self }
}
