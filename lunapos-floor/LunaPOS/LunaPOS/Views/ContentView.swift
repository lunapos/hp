import SwiftUI

enum AppScreen: Hashable {
    case floor
    case cast
    case admin
}

struct ContentView: View {
    @State private var vm = AppViewModel()
    @State private var selectedTableId: String?
    @State private var showCheckout = false
    @State private var path = NavigationPath()
    @AppStorage("lunaDarkMode") private var isDarkMode = true
    @State private var isSyncing = false

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
                    case .admin:
                        AdminView()
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
    }

    @ViewBuilder
    private var mainFloorView: some View {
        VStack(spacing: 0) {
            customHeaderBar
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
                HStack(spacing: 6) {
                    if isSyncing {
                        ProgressView()
                            .controlSize(.small)
                            .tint(.lunaGold)
                    }
                    Text("☽ Luna POS")
                        .font(.system(size: 16, weight: .bold))
                        .tracking(1)
                        .foregroundStyle(.lunaGold)
                }
            }

            Spacer()

            // Center: Today's sales
            HStack(spacing: 8) {
                Text("本日売上")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.lunaSubtle)
                Text(vm.totalSales.yenFormatted)
                    .font(.system(size: 30, weight: .heavy, design: .rounded))
                    .foregroundStyle(.lunaGold)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 6)
            .background(Color.lunaGold.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 10))

            Spacer()

            // Right: Action buttons
            HStack(spacing: 20) {
                Button {
                    isDarkMode.toggle()
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: isDarkMode ? "sun.max" : "moon.fill")
                            .font(.system(size: 22))
                        Text(isDarkMode ? "ライト" : "ダーク")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundStyle(.white)
                }

                Button {
                    path.append(AppScreen.cast)
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: "person.badge.clock")
                            .font(.system(size: 22))
                        Text("キャスト")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundStyle(.white)
                }

                Button {
                    path.append(AppScreen.admin)
                } label: {
                    VStack(spacing: 3) {
                        Image(systemName: "yensign.circle")
                            .font(.system(size: 22))
                        Text("レジ")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundStyle(.white)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.lunaDark)
    }
}

extension String: @retroactive Identifiable {
    public var id: String { self }
}
