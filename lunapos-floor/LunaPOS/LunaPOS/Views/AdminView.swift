import SwiftUI

enum AdminTab: String, CaseIterable {
    case report = "レポート"
    case cast = "キャスト"
    case menu = "メニュー"
    case settings = "設定"

    var icon: String {
        switch self {
        case .report: "chart.bar"
        case .cast: "person.2"
        case .menu: "bag"
        case .settings: "gearshape"
        }
    }
}

// MARK: - Admin View

struct AdminView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var tab: AdminTab = .report

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
            .background(.white)
            .overlay(alignment: .bottom) { Divider() }

            // Tab content
            ScrollView {
                switch tab {
                case .report: ReportTabView()
                case .cast: CastManagementTabView()
                case .menu: MenuManagementTabView()
                case .settings: SettingsTabView()
                }
            }
            .background(Color.lunaBg)
        }
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("レジ").font(.headline).foregroundStyle(.lunaGold).tracking(4)
            }
        }
        .toolbarBackground(Color.lunaDark, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

// MARK: - Report Tab

struct ReportTabView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var registerInput = ""
    @State private var withdrawalInput = ""
    @State private var withdrawalNote = ""

    private var todayStart: Date { Calendar.current.startOfDay(for: Date()) }

    var body: some View {
        let todayPayments = vm.todayPayments
        let todayVisits = vm.todayVisits
        let totalSales = todayPayments.reduce(0) { $0 + $1.total }
        let totalGroups = todayVisits.count
        let totalGuests = todayVisits.reduce(0) { $0 + $1.guestCount }
        let avgSpend = totalGroups > 0 ? totalSales / totalGroups : 0
        let checkedOut = todayVisits.filter { $0.isCheckedOut && $0.checkOutTime != nil }
        let avgStayMin = checkedOut.isEmpty ? 0 : checkedOut.reduce(0) { sum, v in
            sum + Int(v.checkOutTime!.timeIntervalSince(v.checkInTime) / 60)
        } / checkedOut.count

        VStack(spacing: 12) {
            // Metrics grid
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                metricCard("本日売上", totalSales.yenFormatted, icon: "chart.line.uptrend.xyaxis", gold: true)
                metricCard("来店組数", "\(totalGroups)組", icon: "person.2", sub: "\(totalGuests)名")
                metricCard("客単価", avgSpend.yenFormatted, icon: "creditcard", sub: "1組あたり")
                metricCard("平均滞在", avgStayMin > 0 ? "\(avgStayMin)分" : "--", icon: "clock")
            }

            // Payment methods
            let methodTotals = Dictionary(grouping: todayPayments, by: \.paymentMethod)
                .mapValues { $0.reduce(0) { $0 + $1.total } }

            if !methodTotals.isEmpty {
                GroupBox {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("支払い方法", systemImage: "creditcard.and.123")
                            .font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)
                        ForEach(methodTotals.sorted(by: { $0.key.rawValue < $1.key.rawValue }), id: \.key) { method, amount in
                            HStack {
                                Text(method.label).font(.subheadline)
                                Spacer()
                                Text(amount.yenFormatted).font(.subheadline.bold()).foregroundStyle(.lunaGoldDark)
                            }
                        }
                    }
                }
            }

            // Register
            registerSection(todayPayments: todayPayments)

            // Cast ranking
            castRankingSection(todayPayments: todayPayments, todayVisits: todayVisits)

            // Payment history
            if !todayPayments.isEmpty {
                GroupBox {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("会計履歴", systemImage: "clock.arrow.circlepath")
                            .font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)
                        ForEach(todayPayments) { p in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(p.customerName ?? "—").font(.subheadline)
                                    Text(p.paidAt.hhMM).font(.caption).foregroundStyle(.lunaMuted)
                                }
                                Spacer()
                                VStack(alignment: .trailing) {
                                    Text(p.total.yenFormatted).font(.subheadline.bold()).foregroundStyle(.lunaGoldDark)
                                    Text(p.paymentMethod.label).font(.caption).foregroundStyle(.lunaMuted)
                                }
                            }
                        }
                    }
                }
            }

            if totalGroups == 0 {
                Text("NO DATA TODAY")
                    .font(.subheadline)
                    .foregroundStyle(.lunaLight)
                    .tracking(4)
                    .padding(.vertical, 60)
            }
        }
        .padding()
        .onAppear {
            registerInput = "\(vm.registerStartAmount)"
        }
    }

    @ViewBuilder
    private func metricCard(_ label: String, _ value: String, icon: String, gold: Bool = false, sub: String? = nil) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(label).font(.caption).foregroundStyle(.lunaMuted).tracking(2)
                Spacer()
                Image(systemName: icon).foregroundStyle(.lunaLavender)
            }
            Text(value).font(.title2.bold()).foregroundStyle(gold ? .lunaGoldDark : .primary)
            if let sub {
                Text(sub).font(.caption).foregroundStyle(.lunaMuted)
            }
        }
        .padding()
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaBorder))
    }

    @ViewBuilder
    private func registerSection(todayPayments: [Payment]) -> some View {
        let cashReceived = todayPayments.filter { $0.paymentMethod == .cash }.reduce(0) { $0 + $1.total }
        let todayWithdrawals = vm.cashWithdrawals.filter { $0.createdAt >= todayStart }
        let totalWithdrawn = todayWithdrawals.reduce(0) { $0 + $1.amount }
        let expectedCash = vm.registerStartAmount + cashReceived - totalWithdrawn

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

    @ViewBuilder
    private func castRankingSection(todayPayments: [Payment], todayVisits: [Visit]) -> some View {
        let castPerf = vm.casts.compactMap { cast -> (Cast, Int, Int)? in
            let noms = vm.castNominations(castId: cast.id)
            let sales = vm.castSales(castId: cast.id)
            if noms == 0 && sales == 0 { return nil }
            return (cast, noms, sales)
        }.sorted { $0.2 > $1.2 }

        if !castPerf.isEmpty {
            GroupBox {
                VStack(alignment: .leading, spacing: 8) {
                    Label("Cast Ranking", systemImage: "star")
                        .font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)
                    ForEach(castPerf.indices, id: \.self) { idx in
                        let (cast, noms, sales) = castPerf[idx]
                        HStack(spacing: 12) {
                            Text("\(idx + 1)")
                                .font(.subheadline.bold())
                                .foregroundStyle(idx == 0 ? .lunaGoldDark : .lunaLight)
                                .frame(width: 20)

                            avatarView(cast: cast, size: 28)

                            Text(cast.stageName).font(.subheadline)
                            Spacer()
                            Text("指名\(noms)件").font(.caption).foregroundStyle(.lunaMuted)
                            Text(sales.yenFormatted).font(.subheadline.bold()).foregroundStyle(.lunaGoldDark)
                        }
                    }
                }
            }
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

// MARK: - Cast Management Tab

struct CastManagementTabView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var showAdd = false
    @State private var editingCast: Cast?

    var body: some View {
        VStack(spacing: 12) {
            Button { showAdd = true } label: {
                Label("キャストを追加", systemImage: "plus")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .font(.headline)
            }
            .buttonStyle(.borderedProminent)
            .tint(.lunaDark)

            ForEach(vm.casts) { cast in
                HStack(spacing: 12) {
                    avatarView(cast: cast, size: 40)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(cast.stageName).font(.subheadline.bold())
                        if !cast.realName.isEmpty {
                            Text(cast.realName).font(.caption).foregroundStyle(.lunaMuted)
                        }
                        HStack(spacing: 12) {
                            if let s = cast.scheduledClockIn {
                                Text("\(s)〜\(cast.scheduledClockOut ?? "")").font(.caption).foregroundStyle(.lunaMuted)
                            }
                            let noms = vm.castNominations(castId: cast.id)
                            if noms > 0 {
                                Text("指名 \(noms)").font(.caption).foregroundStyle(.lunaMuted)
                            }
                            let sales = vm.castSales(castId: cast.id)
                            if sales > 0 {
                                Text(sales.yenFormatted).font(.caption.bold()).foregroundStyle(.lunaGoldDark)
                            }
                        }
                    }

                    Spacer()

                    Button { editingCast = cast } label: {
                        Image(systemName: "pencil").font(.caption)
                    }
                    .buttonStyle(.bordered)
                    .tint(.lunaMuted)
                }
                .padding(12)
                .background(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaBorder))
            }
        }
        .padding()
        .sheet(isPresented: $showAdd) {
            AddCastSheet().environment(vm)
        }
    }
}

// MARK: - Menu Management Tab

struct MenuManagementTabView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var showAdd = false
    @State private var addName = ""
    @State private var addPrice = ""
    @State private var addCategory: MenuCategory = .drink
    @State private var expandedCategory: MenuCategory? = .drink

    var body: some View {
        VStack(spacing: 12) {
            Button { showAdd.toggle() } label: {
                Label("メニューを追加", systemImage: "plus")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .font(.headline)
            }
            .buttonStyle(.borderedProminent)
            .tint(.lunaDark)

            if showAdd {
                GroupBox {
                    VStack(spacing: 12) {
                        HStack {
                            Text("New Menu Item").font(.caption.bold()).foregroundStyle(.lunaGoldDark).tracking(2)
                            Spacer()
                            Button { showAdd = false } label: { Image(systemName: "xmark").font(.caption) }
                                .tint(.lunaMuted)
                        }
                        Picker("カテゴリ", selection: $addCategory) {
                            ForEach(MenuCategory.allCases, id: \.self) { cat in
                                Text(cat.label).tag(cat)
                            }
                        }
                        TextField("商品名", text: $addName).textFieldStyle(.roundedBorder)
                        TextField("価格", text: $addPrice).textFieldStyle(.roundedBorder).keyboardType(.numberPad)
                        Button("追加する") {
                            if let price = Int(addPrice), price > 0, !addName.isEmpty {
                                vm.addMenuItem(name: addName.trimmingCharacters(in: .whitespaces), price: price, category: addCategory)
                                addName = ""
                                addPrice = ""
                                showAdd = false
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.lunaDark)
                        .disabled(addName.isEmpty || Int(addPrice) ?? 0 <= 0)
                    }
                }
            }

            ForEach(MenuCategory.allCases, id: \.self) { cat in
                let items = vm.menuItems.filter { $0.category == cat }
                VStack(spacing: 0) {
                    Button {
                        withAnimation { expandedCategory = expandedCategory == cat ? nil : cat }
                    } label: {
                        HStack {
                            Text(cat.label).font(.subheadline.bold())
                            Spacer()
                            Text("\(items.count)件").font(.caption).foregroundStyle(.lunaMuted)
                            Image(systemName: expandedCategory == cat ? "chevron.up" : "chevron.down")
                                .font(.caption).foregroundStyle(.lunaMuted)
                        }
                        .padding()
                    }
                    .buttonStyle(.plain)

                    if expandedCategory == cat {
                        Divider()
                        if items.isEmpty {
                            Text("メニューなし").font(.caption).foregroundStyle(.lunaLight).padding()
                        } else {
                            ForEach(items) { item in
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(item.name).font(.subheadline)
                                        Text(item.price.yenFormatted).font(.caption).foregroundStyle(.lunaGoldDark)
                                    }
                                    Spacer()
                                    Button {
                                        vm.toggleMenuItem(id: item.id)
                                    } label: {
                                        Text(item.isActive ? "提供中" : "停止中")
                                            .font(.caption.bold())
                                    }
                                    .buttonStyle(.bordered)
                                    .tint(item.isActive ? .green : .secondary)
                                }
                                .padding(.horizontal)
                                .padding(.vertical, 8)
                                Divider()
                            }
                        }
                    }
                }
                .background(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaBorder))
            }
        }
        .padding()
    }
}

// MARK: - Settings Tab

struct SettingsTabView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var editingRoomId: String?
    @State private var editRoomName = ""
    @State private var addingRoom = false
    @State private var newRoomName = ""

    var body: some View {
        VStack(spacing: 16) {
            // Room management
            GroupBox {
                VStack(alignment: .leading, spacing: 12) {
                    Label("部屋管理", systemImage: "rectangle.split.3x1")
                        .font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)

                    ForEach(vm.rooms) { room in
                        HStack(spacing: 8) {
                            if editingRoomId == room.id {
                                TextField("部屋名", text: $editRoomName)
                                    .textFieldStyle(.roundedBorder)
                                Button {
                                    if !editRoomName.isEmpty {
                                        vm.updateRoom(id: room.id, name: editRoomName.trimmingCharacters(in: .whitespaces))
                                        editingRoomId = nil
                                    }
                                } label: { Image(systemName: "checkmark") }
                                .tint(.lunaGoldDark)
                                Button { editingRoomId = nil } label: { Image(systemName: "xmark") }
                                .tint(.lunaMuted)
                            } else {
                                Text(room.name).font(.subheadline)
                                Spacer()
                                let tableCount = vm.tables.filter { $0.roomId == room.id }.count
                                Text("\(tableCount) tables").font(.caption).foregroundStyle(.lunaMuted)
                                Button {
                                    editingRoomId = room.id
                                    editRoomName = room.name
                                } label: { Image(systemName: "pencil").font(.caption) }
                                .buttonStyle(.bordered).tint(.lunaMuted)
                                Button {
                                    vm.deleteRoom(id: room.id)
                                } label: { Image(systemName: "trash").font(.caption) }
                                .buttonStyle(.bordered).tint(.red)
                                .disabled(vm.rooms.count <= 1)
                            }
                        }
                        .padding(12)
                        .background(Color.lunaCard)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    if addingRoom {
                        HStack {
                            TextField("部屋名を入力", text: $newRoomName).textFieldStyle(.roundedBorder)
                            Button("追加") {
                                if !newRoomName.isEmpty {
                                    vm.addRoom(name: newRoomName.trimmingCharacters(in: .whitespaces))
                                    newRoomName = ""
                                    addingRoom = false
                                }
                            }
                            .buttonStyle(.borderedProminent).tint(.lunaDark)
                            Button { addingRoom = false; newRoomName = "" } label: {
                                Image(systemName: "xmark")
                            }.tint(.lunaMuted)
                        }
                    } else {
                        Button { addingRoom = true } label: {
                            Label("部屋を追加", systemImage: "plus")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                        }
                        .buttonStyle(.bordered)
                        .tint(.lunaMuted)
                    }
                }
            }

            // Table room assignment
            GroupBox {
                VStack(alignment: .leading, spacing: 12) {
                    Label("テーブル割り当て", systemImage: "tablecells")
                        .font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)

                    ForEach(vm.tables) { table in
                        HStack {
                            Text(table.name).font(.subheadline).frame(width: 80, alignment: .leading)
                            Picker("", selection: Binding(
                                get: { table.roomId },
                                set: { vm.moveTableRoom(tableId: table.id, roomId: $0) }
                            )) {
                                ForEach(vm.rooms) { room in
                                    Text(room.name).tag(room.id)
                                }
                            }
                            .pickerStyle(.menu)
                        }
                        .padding(12)
                        .background(Color.lunaCard)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
        }
        .padding()
    }
}
