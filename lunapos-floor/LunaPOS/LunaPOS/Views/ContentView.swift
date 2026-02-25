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
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button {
                                selectedTableId = nil
                                showCheckout = false
                            } label: {
                                HStack(spacing: 4) {
                                    Image(systemName: "arrow.left")
                                    Text("LunaPos").font(.caption.bold())
                                }
                            }
                        }
                    }
                    .toolbarBackground(Color.lunaDark, for: .navigationBar)
                    .toolbarBackground(.visible, for: .navigationBar)
                    .toolbarColorScheme(.dark, for: .navigationBar)
                }
            }
        }
    }

    @ViewBuilder
    private var mainFloorView: some View {
        VStack(spacing: 0) {
            FloorView(
                selectedTableId: $selectedTableId,
                showCheckout: $showCheckout
            )
            .environment(vm)
        }
        .toolbar {
            ToolbarItem(placement: .navigation) {
                HStack(spacing: 4) {
                    Text("☽").font(.caption).foregroundStyle(.lunaGold.opacity(0.6))
                    VStack(alignment: .leading, spacing: 0) {
                        Text("LunaPos").font(.subheadline.bold()).tracking(2).foregroundStyle(.lunaGold)
                        Text("Floor").font(.system(size: 9, weight: .semibold)).tracking(4).foregroundStyle(.lunaGold.opacity(0.5))
                    }
                }
            }

            ToolbarItem(placement: .principal) {
                VStack(spacing: 0) {
                    Text("売上").font(.system(size: 10)).foregroundStyle(.lunaSubtle)
                    Text(vm.totalSales.yenFormatted).font(.subheadline.bold()).foregroundStyle(.lunaGold)
                }
            }

            ToolbarItemGroup(placement: .primaryAction) {
                Button {
                    path.append(AppScreen.cast)
                } label: {
                    VStack(spacing: 2) {
                        Image(systemName: "person.badge.clock").font(.subheadline)
                        Text("キャスト").font(.system(size: 10, weight: .semibold)).tracking(1)
                    }
                }

                Button {
                    path.append(AppScreen.admin)
                } label: {
                    VStack(spacing: 2) {
                        Image(systemName: "yensign.circle").font(.subheadline)
                        Text("レジ").font(.system(size: 10, weight: .semibold)).tracking(1)
                    }
                }
            }
        }
        .toolbarBackground(Color.lunaDark, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

extension String: @retroactive Identifiable {
    public var id: String { self }
}
