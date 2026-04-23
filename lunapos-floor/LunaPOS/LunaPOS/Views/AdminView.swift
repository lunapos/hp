import SwiftUI

enum AdminTab: String, CaseIterable {
    case register = "レジ"
    case device = "端末"

    var icon: String {
        switch self {
        case .register: "yensign.circle"
        case .device: "ipad"
        }
    }
}

// MARK: - Admin View

struct AdminView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var tab: AdminTab = .register

    var body: some View {
        VStack(spacing: 0) {
            // Tab bar
            HStack(spacing: 0) {
                ForEach(AdminTab.allCases, id: \.self) { t in
                    Button {
                        tab = t
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: t.icon).font(.subheadline)
                            Text(t.rawValue).font(.caption.bold()).tracking(1)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .foregroundStyle(tab == t ? .lunaGoldDark : .lunaMuted)
                        .overlay(alignment: .bottom) {
                            if tab == t {
                                Rectangle().fill(Color.lunaGoldDark).frame(height: 2)
                            }
                        }
                    }
                }
            }
            .background(.lunaCard)
            .overlay(alignment: .bottom) { Divider() }

            // Tab content
            ScrollView {
                switch tab {
                case .register: RegisterTabView()
                case .device: DeviceTabView()
                }
            }
            .background(Color.lunaBg)
        }
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("管理").font(.headline).foregroundStyle(.lunaGold).tracking(4)
            }
        }
        .toolbarBackground(Color.lunaDark, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

// MARK: - Register Tab（レジ精算）

struct RegisterTabView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var registerInput = ""
    @State private var withdrawalInput = ""
    @State private var withdrawalNote = ""

    private var todayStart: Date { Calendar.current.startOfDay(for: Date()) }

    var body: some View {
        let todayPayments = vm.todayPayments
        let cashReceived = todayPayments.filter { $0.paymentMethod == .cash }.reduce(0) { $0 + $1.total }
        let todayWithdrawals = vm.cashWithdrawals.filter { $0.createdAt >= todayStart }
        let totalWithdrawn = todayWithdrawals.reduce(0) { $0 + $1.amount }
        let expectedCash = vm.registerStartAmount + cashReceived - totalWithdrawn

        VStack(spacing: 12) {
            GroupBox {
                VStack(alignment: .leading, spacing: 12) {
                    Label("レジ締め", systemImage: "yensign.circle")
                        .font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)

                    // Start amount
                    HStack {
                        Text("スタート金").font(.subheadline).foregroundStyle(.lunaMuted).frame(width: 90, alignment: .leading)
                        HStack(spacing: 4) {
                            Text("¥").foregroundStyle(.lunaMuted)
                            TextField("0", text: $registerInput)
                                .keyboardType(.numberPad)
                                .textFieldStyle(.roundedBorder)
                            Button("SET") {
                                if let v = Int(registerInput) {
                                    vm.setRegisterStart(amount: v)
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.lunaDark)
                            .font(.caption.bold())
                        }
                    }

                    Divider()

                    // Withdrawal
                    HStack {
                        Text("出金記録").font(.subheadline).foregroundStyle(.lunaMuted).frame(width: 90, alignment: .leading)
                        HStack(spacing: 4) {
                            TextField("金額", text: $withdrawalInput)
                                .keyboardType(.numberPad)
                                .textFieldStyle(.roundedBorder)
                                .frame(width: 80)
                            TextField("メモ", text: $withdrawalNote)
                                .textFieldStyle(.roundedBorder)
                            Button("出金") {
                                if let v = Int(withdrawalInput), v > 0 {
                                    vm.addCashWithdrawal(amount: v, note: withdrawalNote.isEmpty ? nil : withdrawalNote)
                                    withdrawalInput = ""
                                    withdrawalNote = ""
                                }
                            }
                            .buttonStyle(.bordered)
                            .tint(.red)
                            .font(.caption.bold())
                        }
                    }

                    // Withdrawal list
                    if !todayWithdrawals.isEmpty {
                        Divider()
                        ForEach(todayWithdrawals) { w in
                            HStack {
                                Text(w.note ?? "出金").font(.caption).foregroundStyle(.lunaMuted)
                                Text(w.createdAt.hhMM).font(.caption).foregroundStyle(.lunaLight)
                                Spacer()
                                Text("−\(w.amount.yenFormatted)").font(.caption).foregroundStyle(.red)
                            }
                        }
                    }

                    Divider()

                    // Summary
                    VStack(spacing: 4) {
                        summaryRow("スタート金", vm.registerStartAmount.yenFormatted)
                        summaryRow("現金入金計", "+\(cashReceived.yenFormatted)")
                        if totalWithdrawn > 0 {
                            summaryRow("出金計", "−\(totalWithdrawn.yenFormatted)", color: .red)
                        }
                        Divider()
                        HStack {
                            Text("予測現金残高").font(.headline).foregroundStyle(.lunaGoldDark)
                            Spacer()
                            Text(expectedCash.yenFormatted).font(.headline.bold()).foregroundStyle(.lunaGoldDark)
                        }
                    }
                }
            }
        }
        .padding()
        .onAppear {
            registerInput = "\(vm.registerStartAmount)"
        }
    }

    @ViewBuilder
    private func summaryRow(_ label: String, _ value: String, color: Color? = nil) -> some View {
        HStack {
            Text(label).font(.subheadline).foregroundStyle(.lunaMuted)
            Spacer()
            Text(value).font(.subheadline).foregroundStyle(color ?? .primary)
        }
    }
}

// MARK: - Device Tab（端末情報）

struct DeviceTabView: View {
    @State private var showLogoutConfirm = false

    var body: some View {
        VStack(spacing: 16) {
            GroupBox {
                VStack(alignment: .leading, spacing: 12) {
                    Label("端末情報", systemImage: "ipad")
                        .font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)

                    let svc = SupabaseService.shared
                    HStack {
                        Text("デバイス名").font(.subheadline).foregroundStyle(.lunaMuted)
                        Spacer()
                        Text(svc.deviceName ?? "未接続").font(.subheadline)
                    }
                    HStack {
                        Text("接続状態").font(.subheadline).foregroundStyle(.lunaMuted)
                        Spacer()
                        HStack(spacing: 6) {
                            Circle()
                                .fill(svc.isAuthenticated ? Color.green : Color.red)
                                .frame(width: 8, height: 8)
                            Text(svc.isAuthenticated ? "接続中" : "未接続")
                                .font(.subheadline)
                        }
                    }

                    Divider()

                    Button(role: .destructive) {
                        showLogoutConfirm = true
                    } label: {
                        Label("この端末の接続を解除", systemImage: "arrow.right.square")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }
            }
            .alert("接続を解除しますか？", isPresented: $showLogoutConfirm) {
                Button("解除する", role: .destructive) {
                    SupabaseService.shared.logout()
                    NotificationCenter.default.post(name: .lunaDidLogout, object: nil)
                }
                Button("キャンセル", role: .cancel) {}
            } message: {
                Text("再度使用するにはデバイストークンの入力が必要です")
            }
        }
        .padding()
    }
}
