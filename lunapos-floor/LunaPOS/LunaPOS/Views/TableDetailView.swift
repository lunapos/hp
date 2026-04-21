import SwiftUI

// MARK: - Active Category

enum ActiveCategory: Hashable {
    case menu(MenuCategory)
    case expense
    case nomination

    var label: String {
        switch self {
        case .menu(let cat): cat.label
        case .expense: "建て替え"
        case .nomination: "指名・同伴"
        }
    }

    static let all: [ActiveCategory] = MenuCategory.allCases.map { .menu($0) } + [.nomination, .expense]
}

// MARK: - Aggregated Item

struct AggregatedItem: Identifiable {
    let id: String
    let name: String
    var price: Int
    var quantity: Int
    let itemIds: [String]
    let isExpense: Bool
    let menuItemId: String
}

// MARK: - Move Table Sheet

struct MoveTableSheet: View {
    let currentTableId: String
    let onMove: (String) -> Void
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            let emptyTables = vm.tables.filter { $0.id != currentTableId && $0.status == .empty }

            if emptyTables.isEmpty {
                Text("空きテーブルがありません")
                    .foregroundStyle(.lunaMuted)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List(emptyTables) { t in
                    let room = vm.rooms.first(where: { $0.id == t.roomId })
                    Button {
                        onMove(t.id)
                        dismiss()
                    } label: {
                        HStack {
                            Text(t.name).fontWeight(.semibold)
                            Spacer()
                            Text(room?.name ?? "").font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .presentationDetents([.medium])
        .navigationTitle("卓移動先を選択")
    }
}

// MARK: - Nomination Edit Sheet

struct NominationEditSheet: View {
    let visitId: String
    let currentNominations: [CastNomination]
    let currentDouhanCastId: String?
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss

    struct Entry: Identifiable {
        let id = UUID()
        var castId: String
        var nominationType: NominationType
        var isDouhan: Bool
    }

    @State private var entries: [Entry] = []

    private var totalFee: Int {
        entries.reduce(0) { sum, e in
            var fee = 0
            if e.nominationType == .main { fee += vm.storeSettings.nominationFeeMain }
            if e.nominationType == .inStore { fee += vm.storeSettings.nominationFeeInStore }
            if e.isDouhan { fee += vm.storeSettings.douhanFee }
            return sum + fee
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 8) {
                    ForEach(entries.indices, id: \.self) { i in
                        HStack(spacing: 8) {
                            Picker("キャスト", selection: $entries[i].castId) {
                                Text("キャスト選択").tag("")
                                ForEach(vm.workingCasts) { c in
                                    Text(c.stageName).tag(c.id)
                                }
                            }
                            .pickerStyle(.menu)

                            Picker("指名", selection: $entries[i].nominationType) {
                                Text("なし").tag(NominationType.none)
                                Text("場内").tag(NominationType.inStore)
                                Text("本指名").tag(NominationType.main)
                            }
                            .pickerStyle(.menu)

                            Button {
                                let was = entries[i].isDouhan
                                for j in entries.indices { entries[j].isDouhan = false }
                                entries[i].isDouhan = !was
                            } label: {
                                Text(entries[i].isDouhan ? "同伴 ¥\(vm.storeSettings.douhanFee.formatted())" : "同伴")
                                    .font(.caption.bold())
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 6)
                                    .background(entries[i].isDouhan ? Color.lunaGoldDark : .clear)
                                    .foregroundStyle(entries[i].isDouhan ? .lunaDark : .lunaMuted)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(entries[i].isDouhan ? Color.lunaGoldDark : .lunaBorder))
                            }

                            Button { entries.remove(at: i) } label: {
                                Image(systemName: "xmark").font(.caption)
                            }
                            .tint(.lunaMuted)
                        }
                        .padding(8)
                        .background(Color.lunaCard)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    Button {
                        entries.append(Entry(castId: "", nominationType: .none, isDouhan: false))
                    } label: {
                        Label("キャストを追加", systemImage: "plus")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                    }
                    .buttonStyle(.bordered)

                    if totalFee > 0 {
                        Text("指名・同伴料計: \(totalFee.yenFormatted)")
                            .font(.caption)
                            .foregroundStyle(.lunaGoldDark)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                    }
                }
                .padding()
            }
            .navigationTitle("指名・同伴 編集")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        let nominations = entries
                            .filter { !$0.castId.isEmpty && ($0.nominationType == .inStore || $0.nominationType == .main) }
                            .map { CastNomination(castId: $0.castId, nominationType: $0.nominationType) }
                        let douhanCastId = entries.first(where: { !$0.castId.isEmpty && $0.isDouhan })?.castId
                        vm.updateVisitNominations(visitId: visitId, nominations: nominations, douhanCastId: douhanCastId)
                        dismiss()
                    }
                    .fontWeight(.bold)
                }
            }
            .onAppear {
                var allCastIds = Set<String>()
                currentNominations.forEach { allCastIds.insert($0.castId) }
                if let d = currentDouhanCastId { allCastIds.insert(d) }

                if allCastIds.isEmpty {
                    entries = [Entry(castId: "", nominationType: .none, isDouhan: false)]
                } else {
                    entries = allCastIds.map { castId in
                        let nom = currentNominations.first(where: { $0.castId == castId })
                        return Entry(
                            castId: castId,
                            nominationType: nom?.nominationType ?? .none,
                            isDouhan: castId == currentDouhanCastId
                        )
                    }
                }
            }
        }
    }
}

// MARK: - Table Detail View

struct TableDetailView: View {
    let tableId: String
    @Environment(AppViewModel.self) private var vm
    @Binding var showCheckout: Bool
    @Binding var selectedTableId: String?

    @State private var activeCategory: ActiveCategory = .menu(.drink)
    @State private var showMoveSheet = false
    @State private var showExtensionToast = false
    @State private var customName = ""
    @State private var customPrice = ""
    @State private var editingPriceKey: String?
    @State private var editingPriceValue = ""
    @State private var isEditingCustomerName = false
    @State private var editingCustomerName = ""

    private var table: FloorTable? { vm.tables.first(where: { $0.id == tableId }) }
    private var visit: Visit? { table?.visitId.flatMap { vid in vm.visits.first(where: { $0.id == vid }) } }

    var body: some View {
        if let table, let visit {
            tableContent(table: table, visit: visit)
        } else {
            VStack {
                Text("テーブルが見つかりません").foregroundStyle(.lunaMuted)
                Button("フロアへ戻る") { selectedTableId = nil }
                    .tint(.lunaGoldDark)
            }
        }
    }

    @ViewBuilder
    private func tableContent(table: FloorTable, visit: Visit) -> some View {
        let breakdown = PriceCalculator.calculate(visit: visit, setPlans: vm.setPlans, settings: vm.storeSettings)
        let total = max(0, breakdown.chargedAmount) + breakdown.expenseTotal
        let elapsedMins = visit.checkInTime.elapsedMinutes()
        let isOvertime = elapsedMins >= visit.totalSetMinutes

        HStack(spacing: 0) {
            // 左: ヘッダー + メニュー
            VStack(spacing: 0) {
                tableHeaderBar(table: table, visit: visit, isOvertime: isOvertime)
                menuPane(visit: visit)
            }
            // 右: ORDER（上から下まで）
            orderSlipPane(visit: visit, breakdown: breakdown, total: total)
        }
        .background(Color.lunaBg)
        .navigationBarHidden(true)
        .sheet(isPresented: $showMoveSheet) {
            MoveTableSheet(currentTableId: tableId) { toId in
                vm.moveVisit(fromTableId: tableId, toTableId: toId)
                selectedTableId = toId
            }
            .environment(vm)
        }
        .overlay(alignment: .top) {
            if showExtensionToast {
                Text("延長30分 追加しました")
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.lunaGoldDark.opacity(0.9))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .padding(.top, 60)
            }
        }
    }

    private func tableHeaderBar(table: FloorTable, visit: Visit, isOvertime: Bool) -> some View {
        HStack(spacing: 8) {
            // 左: 戻るボタン
            Button {
                selectedTableId = nil
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.left")
                    Text("LunaPos").font(.caption.bold())
                }
                .foregroundStyle(.white)
            }

            Spacer()

            // 中央: テーブル情報
            tableToolbarTitle(table: table, visit: visit)

            Spacer()

            // 右: 転卓ボタン
            tableToolbarActions(table: table)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color.lunaDark)
    }

    // MARK: - Menu Pane (Left)

    private func menuPane(visit: Visit) -> some View {
        VStack(spacing: 0) {
            // 延長ボタン + カテゴリタブ
            HStack(spacing: 8) {
                extensionButton(visit: visit)
                categoryTabsBar
            }
            menuGridContent(visit: visit)
        }
    }

    private func extensionButton(visit: Visit) -> some View {
        let elapsedMins = visit.checkInTime.elapsedMinutes()
        let isOvertime = elapsedMins >= visit.totalSetMinutes
        let fee = vm.storeSettings.extensionFeePerPerson
        return Button {
            vm.addExtension(visitId: visit.id, minutes: 30, pricePerPerson: fee)
            withAnimation { showExtensionToast = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation { showExtensionToast = false }
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: "timer")
                    .font(.system(size: 16))
                VStack(alignment: .leading, spacing: 1) {
                    Text("延長30分")
                        .font(.system(size: 13, weight: .bold))
                    Text(fee.yenFormatted)
                        .font(.system(size: 11))
                        .foregroundStyle(isOvertime ? .red.opacity(0.8) : .lunaGoldDark)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isOvertime ? Color.red.opacity(0.15) : Color.lunaDark)
            .foregroundStyle(isOvertime ? .red : .lunaGold)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(isOvertime ? Color.red.opacity(0.4) : Color.lunaGold.opacity(0.3)))
        }
        .buttonStyle(.plain)
        .padding(.leading, 12)
    }

    private var categoryTabsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(ActiveCategory.all, id: \.self) { cat in
                    Button {
                        activeCategory = cat
                        if case .expense = cat {
                            if customName.isEmpty { customName = "タバコ" }
                        }
                    } label: {
                        Text(cat.label)
                            .font(.system(size: 14, weight: .semibold))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(activeCategory == cat ? Color.lunaDark : .lunaCard)
                            .foregroundStyle(activeCategory == cat ? .lunaGold : .lunaMuted)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaBorder))
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
        }
        .background(Color.lunaBg)
    }

    private func menuGridContent(visit: Visit) -> some View {
        ScrollView {
            VStack(spacing: 12) {
                switch activeCategory {
                case .nomination:
                    nominationGrid(visit: visit)
                case .expense:
                    Text("サービス料・消費税なし（立替）")
                        .font(.caption)
                        .foregroundStyle(.lunaMuted)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                    customItemForm(visit: visit)
                case .menu(let cat):
                    menuItemsGrid(visit: visit, category: cat)
                    customItemForm(visit: visit)
                }
            }
            .padding(.vertical, 12)
        }
    }

    private func menuItemsGrid(visit: Visit, category: MenuCategory) -> some View {
        let items = vm.menuItems.filter { $0.isActive && $0.category == category }
        return LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(items) { item in
                Button {
                    let orderItem = OrderItem(
                        menuItemId: item.id,
                        menuItemName: item.name,
                        price: item.price,
                        quantity: 1
                    )
                    vm.addOrderItem(visitId: visit.id, item: orderItem)
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.name)
                            .font(.subheadline.weight(.semibold))
                            .multilineTextAlignment(.leading)
                        Text(item.price.yenFormatted)
                            .font(.subheadline.bold())
                            .foregroundStyle(.lunaGoldDark)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(.lunaCard)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaBorder))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal)
    }

    // MARK: - Nomination Grid (in Menu Pane)

    private func nominationGrid(visit: Visit) -> some View {
        VStack(spacing: 8) {
            ForEach(vm.workingCasts) { cast in
                let nom = visit.nominations.first(where: { $0.castId == cast.id })
                let isDouhan = visit.douhanCastId == cast.id
                let isActive = nom != nil || isDouhan

                HStack(spacing: 10) {
                    avatarView(cast: cast, size: 36)

                    Text(cast.stageName)
                        .font(.subheadline.bold())
                        .frame(width: 60, alignment: .leading)
                        .lineLimit(1)

                    Spacer()

                    nominationTypeButton(
                        label: "場内",
                        fee: vm.storeSettings.nominationFeeInStore,
                        isSelected: nom?.nominationType == .inStore
                    ) {
                        toggleNomination(visit: visit, castId: cast.id, type: .inStore)
                    }

                    nominationTypeButton(
                        label: "本指名",
                        fee: vm.storeSettings.nominationFeeMain,
                        isSelected: nom?.nominationType == .main
                    ) {
                        toggleNomination(visit: visit, castId: cast.id, type: .main)
                    }

                    nominationTypeButton(
                        label: "同伴",
                        fee: vm.storeSettings.douhanFee,
                        isSelected: isDouhan
                    ) {
                        toggleDouhan(visit: visit, castId: cast.id)
                    }
                }
                .padding(10)
                .background(isActive ? Color.lunaGoldDark.opacity(0.08) : .lunaCard)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(isActive ? Color.lunaGoldDark.opacity(0.3) : Color.lunaBorder))
            }

            if vm.workingCasts.isEmpty {
                Text("出勤中のキャストがいません")
                    .font(.subheadline)
                    .foregroundStyle(.lunaMuted)
                    .padding(.vertical, 20)
            }
        }
        .padding(.horizontal)
    }

    @ViewBuilder
    private func nominationTypeButton(label: String, fee: Int, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 2) {
                Text(label)
                    .font(.system(size: 13, weight: .bold))
                Text("¥\(fee.formatted())")
                    .font(.system(size: 10))
            }
            .frame(width: 64)
            .padding(.vertical, 6)
            .background(isSelected ? Color.lunaGoldDark : .clear)
            .foregroundStyle(isSelected ? .lunaDark : .lunaMuted)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(isSelected ? Color.lunaGoldDark : Color.lunaBorder))
        }
        .buttonStyle(.plain)
    }

    private func toggleNomination(visit: Visit, castId: String, type: NominationType) {
        var noms = visit.nominations
        if let idx = noms.firstIndex(where: { $0.castId == castId }) {
            if noms[idx].nominationType == type {
                noms.remove(at: idx)
            } else {
                noms[idx] = CastNomination(castId: castId, nominationType: type)
            }
        } else {
            noms.append(CastNomination(castId: castId, nominationType: type))
        }
        vm.updateVisitNominations(visitId: visit.id, nominations: noms, douhanCastId: visit.douhanCastId)
    }

    private func toggleDouhan(visit: Visit, castId: String) {
        let newDouhanId = visit.douhanCastId == castId ? nil : castId
        vm.updateVisitNominations(visitId: visit.id, nominations: visit.nominations, douhanCastId: newDouhanId)
    }

    private func customItemForm(visit: Visit) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(activeCategory == .expense ? "建て替え追加" : "カスタム追加")
                .font(.caption)
                .foregroundStyle(.lunaGoldDark.opacity(0.8))

            TextField("商品名・内容", text: $customName)
                .textFieldStyle(.roundedBorder)

            HStack {
                TextField("金額", text: $customPrice)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.numberPad)

                Button("追加") {
                    guard !customName.isEmpty, let price = Int(customPrice), price > 0 else { return }
                    let item = OrderItem(
                        menuItemId: "custom_\(Date().timeIntervalSince1970)",
                        menuItemName: customName,
                        price: price,
                        quantity: 1,
                        isExpense: activeCategory == .expense
                    )
                    vm.addOrderItem(visitId: visit.id, item: item)
                    customName = ""
                    customPrice = ""
                }
                .buttonStyle(.borderedProminent)
                .tint(.lunaDark)
                .disabled(customName.isEmpty || Int(customPrice) ?? 0 <= 0)
            }
        }
        .padding()
        .background(Color.orange.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaGoldDark.opacity(0.25)))
        .padding(.horizontal)
    }

    // MARK: - Order Slip Pane (Right)

    private func orderSlipPane(visit: Visit, breakdown: PriceCalculator.Breakdown, total: Int) -> some View {
        VStack(spacing: 0) {
            HStack {
                Text("ORDER").font(.subheadline.bold()).foregroundStyle(.lunaMuted).tracking(2)
                Spacer()
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(.lunaCard)
            .overlay(alignment: .bottom) { Divider() }

            orderItemsList(visit: visit, breakdown: breakdown)

            orderTotalsSection(visit: visit, breakdown: breakdown, total: total)
        }
        .frame(width: 360)
        .background(.lunaCard)
        .overlay(alignment: .leading) { Divider() }
    }

    private func orderItemsList(visit: Visit, breakdown: PriceCalculator.Breakdown) -> some View {
        ScrollView {
            VStack(spacing: 4) {
                setRow(visit: visit, price: breakdown.setPrice)

                extensionRows(visit: visit)
                nominationRows(visit: visit)
                douhanRow(visit: visit)
                regularItemRows(visit: visit)
            }
            .padding(8)
            .padding(.bottom, 4)
        }
        .scrollIndicators(.visible)
        .frame(maxHeight: .infinity)
        .background(.lunaCard)
    }

    @ViewBuilder
    private func nominationRows(visit: Visit) -> some View {
        ForEach(visit.nominations.indices, id: \.self) { i in
            let n = visit.nominations[i]
            if n.nominationType != .none {
                let unitFee = PriceCalculator.nominationFee(for: n, overrides: visit.nominationFeeOverrides, settings: vm.storeSettings)
                let cast = vm.casts.first(where: { $0.id == n.castId })
                orderRow(
                    label: "\(cast?.stageName ?? "") \(n.nominationType == .main ? "本指名" : "場内")",
                    qty: n.qty,
                    price: unitFee * n.qty,
                    priceKey: "nom_\(n.castId)",
                    onDecrement: { vm.updateNominationQty(visitId: visit.id, castId: n.castId, qty: n.qty - 1) },
                    onIncrement: { vm.updateNominationQty(visitId: visit.id, castId: n.castId, qty: n.qty + 1) }
                )
            }
        }
    }

    @ViewBuilder
    private func douhanRow(visit: Visit) -> some View {
        if visit.douhanCastId != nil {
            let dc = vm.casts.first(where: { $0.id == visit.douhanCastId })
            let douhanUnitFee = visit.douhanFeeOverride ?? vm.storeSettings.douhanFee
            let dQty = visit.douhanQty
            orderRow(
                label: "同伴 (\(dc?.stageName ?? ""))",
                qty: dQty,
                price: douhanUnitFee * dQty,
                priceKey: "douhan",
                onDecrement: { vm.updateDouhanQty(visitId: visit.id, qty: dQty - 1) },
                onIncrement: { vm.updateDouhanQty(visitId: visit.id, qty: dQty + 1) }
            )
        }
    }

    @ViewBuilder
    private func extensionRows(visit: Visit) -> some View {
        let extItems = visit.orderItems.filter { $0.menuItemId.hasPrefix("ext_") }
        if let last = extItems.last {
            let extCount = extItems.count
            let perPersonPerRound = last.price
            let totalMinutes = extCount * 30
            let totalPrice = extItems.reduce(0) { $0 + $1.price * $1.quantity }
            // 1人あたりの延長合計（全回分）
            let perPersonTotal = perPersonPerRound * extCount
            let currentQty = last.quantity

            VStack(spacing: 2) {
                HStack(spacing: 6) {
                    Text("延長 ×\(currentQty)名")
                        .font(.subheadline)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    HStack(spacing: 6) {
                        Button { vm.removeLastExtension(visitId: visit.id) } label: {
                            Image(systemName: "minus")
                                .font(.system(size: 12))
                                .frame(width: 28, height: 28)
                                .background(.lunaCard)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.lunaBorder))
                        }
                        .buttonStyle(.plain)

                        Text("\(totalMinutes)分")
                            .font(.subheadline.bold())
                            .lineLimit(1)
                            .fixedSize()

                        Button { vm.addExtension(visitId: visit.id, minutes: 30, pricePerPerson: perPersonPerRound) } label: {
                            Image(systemName: "plus")
                                .font(.system(size: 12))
                                .frame(width: 28, height: 28)
                                .background(.lunaCard)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.lunaBorder))
                        }
                        .buttonStyle(.plain)
                    }

                    priceButton(key: "ext_agg", price: perPersonTotal, onConfirm: { newPrice in
                        // 入力値は1人あたり合計 → 回数で割って1回あたりに変換
                        let newPerRound = newPrice / max(extCount, 1)
                        for item in visit.orderItems where item.menuItemId.hasPrefix("ext_") {
                            vm.updateOrderItemPrice(visitId: visit.id, itemId: item.id, price: newPerRound)
                        }
                    })
                }
                HStack {
                    Spacer()
                    Text("×\(currentQty)名")
                        .font(.caption)
                        .foregroundStyle(.lunaMuted)
                }
                HStack {
                    Spacer()
                    Text(totalPrice.yenFormatted)
                        .font(.subheadline.bold())
                        .foregroundStyle(.lunaGoldDark)
                }
            }
            .padding(.vertical, 4)
            .padding(.horizontal, 6)
            .background(Color.lunaDark.opacity(0.3))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    @ViewBuilder
    private func regularItemRows(visit: Visit) -> some View {
        let aggregated = aggregateItems(visit.orderItems.filter { !$0.isExpense && !$0.menuItemId.hasPrefix("ext_") })
        ForEach(aggregated) { item in
            orderItemRow(visitId: visit.id, item: item)
        }
    }

    @ViewBuilder
    private func expenseItemRows(visit: Visit) -> some View {
        let expenseAgg = aggregateItems(visit.orderItems.filter { $0.isExpense })
        if !expenseAgg.isEmpty {
            HStack(spacing: 4) {
                Image(systemName: "receipt").font(.system(size: 12))
                Text("建て替え").font(.caption)
            }
            .foregroundStyle(.orange.opacity(0.7))
            .padding(.horizontal, 10)
            .padding(.top, 4)

            ForEach(expenseAgg) { item in
                orderItemRow(visitId: visit.id, item: item, isExpense: true)
            }
        }

    }

    private func orderTotalsSection(visit: Visit, breakdown: PriceCalculator.Breakdown, total: Int) -> some View {
        VStack(spacing: 6) {
            Divider()
            HStack {
                Text("小計").font(.subheadline).foregroundStyle(.lunaMuted)
                Spacer()
                Text(breakdown.subtotal.yenFormatted).font(.subheadline)
            }
            HStack {
                Text("サービス料 (\(Int(vm.storeSettings.serviceRate * 100))%)")
                    .font(.subheadline).foregroundStyle(.lunaMuted)
                Spacer()
                Text(breakdown.serviceFee.yenFormatted)
                    .font(.subheadline)
                    .foregroundStyle(visit.skipServiceFee ? .lunaMuted : .primary)
                    .strikethrough(visit.skipServiceFee)
                Button { vm.toggleSkipServiceFee(visitId: visit.id) } label: {
                    ZStack(alignment: visit.skipServiceFee ? .leading : .trailing) {
                        Capsule()
                            .frame(width: 44, height: 24)
                            .foregroundStyle(visit.skipServiceFee ? Color.gray.opacity(0.4) : Color.lunaGoldDark)
                        Circle()
                            .frame(width: 20, height: 20)
                            .foregroundStyle(.white)
                            .shadow(radius: 1)
                            .padding(2)
                    }
                }
                .buttonStyle(.plain)
            }
            HStack {
                Text("消費税 (\(Int(vm.storeSettings.taxRate * 100))%)")
                    .font(.subheadline).foregroundStyle(.lunaMuted)
                Spacer()
                Text(breakdown.tax.yenFormatted)
                    .font(.subheadline)
                    .foregroundStyle(visit.skipTax ? .lunaMuted : .primary)
                    .strikethrough(visit.skipTax)
                Button { vm.toggleSkipTax(visitId: visit.id) } label: {
                    ZStack(alignment: visit.skipTax ? .leading : .trailing) {
                        Capsule()
                            .frame(width: 44, height: 24)
                            .foregroundStyle(visit.skipTax ? Color.gray.opacity(0.4) : Color.lunaGoldDark)
                        Circle()
                            .frame(width: 20, height: 20)
                            .foregroundStyle(.white)
                            .shadow(radius: 1)
                            .padding(2)
                    }
                }
                .buttonStyle(.plain)
            }
            expenseItemRows(visit: visit)
            Divider()
            HStack {
                Text("合計").font(.title3.bold()).foregroundStyle(.lunaGoldDark)
                Spacer()
                Text(total.yenFormatted).font(.title2.bold()).foregroundStyle(.lunaGoldDark)
            }

            Button {
                showCheckout = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "creditcard").font(.system(size: 18))
                    Text("会計へ進む").font(.system(size: 17, weight: .bold))
                }
                .foregroundStyle(.lunaDark)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.lunaGold)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(.lunaCard)
    }

    // MARK: - Toolbar Content

    private func tableToolbarTitle(table: FloorTable, visit: Visit) -> some View {
        HStack(spacing: 8) {
            Text(table.name).font(.headline).foregroundStyle(.lunaGold)
            if isEditingCustomerName {
                Text("·").foregroundStyle(.lunaDarkBorder)
                TextField("顧客名", text: $editingCustomerName, onCommit: {
                    vm.updateCustomerName(visitId: visit.id, name: editingCustomerName.isEmpty ? nil : editingCustomerName)
                    isEditingCustomerName = false
                })
                .font(.subheadline)
                .foregroundStyle(.white)
                .textFieldStyle(.roundedBorder)
                .frame(width: 120)
            } else if let name = visit.customerName, !name.isEmpty {
                Text("·").foregroundStyle(.lunaDarkBorder)
                Text(name).foregroundStyle(.white)
                    .onTapGesture {
                        editingCustomerName = name
                        isEditingCustomerName = true
                    }
            } else {
                Text("·").foregroundStyle(.lunaDarkBorder)
                Button {
                    editingCustomerName = ""
                    isEditingCustomerName = true
                } label: {
                    Text("名前追加").font(.caption).foregroundStyle(.lunaSubtle)
                }
            }

            HStack(spacing: 4) {
                Image(systemName: "person").font(.caption).foregroundStyle(.lunaSubtle)
                Button { vm.updateGuestCount(visitId: visit.id, count: visit.guestCount - 1) } label: {
                    Text("−").frame(width: 30, height: 30)
                }
                .buttonStyle(.bordered)
                .tint(.lunaSubtle)

                Text("\(visit.guestCount)")
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .frame(width: 24)

                Button { vm.updateGuestCount(visitId: visit.id, count: visit.guestCount + 1) } label: {
                    Text("＋").frame(width: 30, height: 30)
                }
                .buttonStyle(.bordered)
                .tint(.lunaSubtle)
            }

            Text("·").foregroundStyle(.lunaDarkBorder)
            Image(systemName: "clock").font(.caption).foregroundStyle(.lunaSubtle)
            Text(formatElapsed(visit.checkInTime.elapsedMinutes()))
                .font(.caption)
                .foregroundStyle(.lunaSubtle)
        }
    }

    private func tableToolbarActions(table: FloorTable) -> some View {
        Button { showMoveSheet = true } label: {
            VStack(spacing: 4) {
                Image(systemName: "arrow.left.arrow.right")
                    .font(.system(size: 26))
                Text("転卓")
                    .font(.system(size: 13, weight: .semibold))
            }
            .foregroundStyle(.white)
            .frame(width: 60, height: 52)
        }
    }

    // MARK: - Set Row (unit price × guest count)

    @ViewBuilder
    private func setRow(visit: Visit, price: Int) -> some View {
        let unitPrice = price / max(visit.setGuestCount, 1)

        VStack(spacing: 2) {
            HStack(spacing: 6) {
                Text("セット ×\(visit.setGuestCount)名")
                    .font(.subheadline)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: 6) {
                    Button { vm.updateGuestCount(visitId: visit.id, count: visit.guestCount - 1) } label: {
                        Image(systemName: "minus")
                            .font(.system(size: 12))
                            .frame(width: 28, height: 28)
                            .background(.lunaCard)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.lunaBorder))
                    }
                    .buttonStyle(.plain)

                    Text("\(visit.setMinutes)分")
                        .font(.subheadline.bold())
                        .lineLimit(1)
                        .fixedSize()

                    Button { vm.updateGuestCount(visitId: visit.id, count: visit.guestCount + 1) } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 12))
                            .frame(width: 28, height: 28)
                            .background(.lunaCard)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.lunaBorder))
                    }
                    .buttonStyle(.plain)
                }

                priceButton(key: "set", price: unitPrice, onConfirm: { newPrice in
                    vm.updateSetPrice(visitId: visit.id, price: newPrice)
                })
            }
            HStack {
                Spacer()
                Text("×\(visit.setGuestCount)名")
                    .font(.caption)
                    .foregroundStyle(.lunaMuted)
            }
            HStack {
                Spacer()
                Text(price.yenFormatted)
                    .font(.subheadline.bold())
                    .foregroundStyle(.lunaGoldDark)
            }
        }
        .padding(.vertical, 4)
        .padding(.horizontal, 6)
        .background(Color.lunaDark.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    // MARK: - Order Row

    @ViewBuilder
    private func orderRow(label: String, qty: Int, price: Int, priceKey: String, onDecrement: @escaping () -> Void, onIncrement: @escaping () -> Void) -> some View {
        let unitPrice = price / max(qty, 1)
        VStack(spacing: 2) {
            HStack(spacing: 6) {
                Text(label)
                    .font(.subheadline)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: 6) {
                    Button { onDecrement() } label: {
                        Image(systemName: "minus")
                            .font(.system(size: 12))
                            .frame(width: 28, height: 28)
                            .background(.lunaCard)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.lunaBorder))
                    }
                    .buttonStyle(.plain)

                    Text("\(qty)")
                        .font(.subheadline.bold())
                        .frame(width: 20)

                    Button { onIncrement() } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 12))
                            .frame(width: 28, height: 28)
                            .background(.lunaCard)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.lunaBorder))
                    }
                    .buttonStyle(.plain)
                }
                .frame(width: 82)

                priceButton(key: priceKey, price: unitPrice, onConfirm: { newPrice in
                    switch priceKey {
                    case "set":
                        if let v = visit { vm.updateSetPrice(visitId: v.id, price: newPrice) }
                    case "douhan":
                        if let v = visit { vm.updateDouhanFee(visitId: v.id, fee: newPrice) }
                    case "ext_agg":
                        if let v = visit {
                            let guestCount = v.orderItems.first(where: { $0.menuItemId.hasPrefix("ext_") })?.quantity ?? 1
                            let perPerson = newPrice / max(guestCount, 1)
                            for item in v.orderItems where item.menuItemId.hasPrefix("ext_") {
                                vm.updateOrderItemPrice(visitId: v.id, itemId: item.id, price: perPerson)
                            }
                        }
                    default:
                        if priceKey.hasPrefix("nom_"), let v = visit {
                            let castId = String(priceKey.dropFirst(4))
                            vm.updateNominationFee(visitId: v.id, castId: castId, fee: newPrice)
                        }
                    }
                })
            }
            HStack {
                Spacer()
                Text("計 \(price.yenFormatted)")
                    .font(.subheadline.bold())
                    .foregroundStyle(.lunaGoldDark)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 8)
        .background(Color.lunaCard)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    @ViewBuilder
    private func orderItemRow(visitId: String, item: AggregatedItem, isExpense: Bool = false) -> some View {
        VStack(spacing: 2) {
            HStack(spacing: 6) {
                Text(item.name)
                    .font(.subheadline)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: 6) {
                    Button {
                        if let last = item.itemIds.last {
                            vm.removeOrderItem(visitId: visitId, itemId: last)
                        }
                    } label: {
                        Image(systemName: item.quantity == 1 ? "trash" : "minus")
                            .font(.system(size: 12))
                            .frame(width: 28, height: 28)
                            .background(.lunaCard)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(isExpense ? Color.orange.opacity(0.3) : Color.lunaBorder))
                    }
                    .buttonStyle(.plain)

                    Text("\(item.quantity)")
                        .font(.subheadline.bold())
                        .frame(width: 20)

                    Button {
                        let newItem = OrderItem(
                            menuItemId: item.menuItemId,
                            menuItemName: item.name,
                            price: item.price,
                            quantity: 1,
                            isExpense: isExpense
                        )
                        vm.addOrderItem(visitId: visitId, item: newItem)
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 12))
                            .frame(width: 28, height: 28)
                            .background(.lunaCard)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(isExpense ? Color.orange.opacity(0.3) : Color.lunaBorder))
                    }
                    .buttonStyle(.plain)
                }
                .frame(width: 82)

                priceButton(key: item.id, price: item.price, onConfirm: { newPrice in
                    for itemId in item.itemIds {
                        vm.updateOrderItemPrice(visitId: visitId, itemId: itemId, price: newPrice)
                    }
                })
            }
            HStack {
                Spacer()
                Text("計 \((item.price * item.quantity).yenFormatted)")
                    .font(.subheadline.bold())
                    .foregroundStyle(.lunaGoldDark)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 8)
        .background(isExpense ? Color.orange.opacity(0.05) : Color.lunaCard)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(isExpense ? Color.orange.opacity(0.2) : .clear))
    }

    @ViewBuilder
    private func priceButton(key: String, price: Int, onConfirm: @escaping (Int) -> Void) -> some View {
        if editingPriceKey == key {
            HStack(spacing: 4) {
                Text("¥").font(.system(size: 13)).foregroundStyle(.lunaMuted)
                TextField("", text: $editingPriceValue)
                    .font(.subheadline.bold())
                    .frame(width: 64)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.numberPad)
                    .onSubmit {
                        if let p = Int(editingPriceValue) { onConfirm(max(0, p)) }
                        editingPriceKey = nil
                    }
                Button {
                    if let p = Int(editingPriceValue) { onConfirm(max(0, p)) }
                    editingPriceKey = nil
                } label: {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 26, height: 26)
                        .background(Color.lunaGoldDark)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
            .frame(width: 110, alignment: .trailing)
        } else {
            Button {
                editingPriceKey = key
                editingPriceValue = "\(price)"
            } label: {
                Text(price.yenFormatted)
                    .font(.subheadline)
                    .foregroundStyle(.lunaMuted)
            }
            .buttonStyle(.plain)
            .frame(width: 110, alignment: .trailing)
        }
    }

    // MARK: - Aggregate Items

    private func aggregateItems(_ items: [OrderItem]) -> [AggregatedItem] {
        var result: [AggregatedItem] = []
        for item in items {
            if let idx = result.firstIndex(where: { $0.name == item.menuItemName && $0.price == item.price && $0.isExpense == item.isExpense }) {
                result[idx].quantity += item.quantity
                var ids = result[idx].itemIds
                ids.append(item.id)
                result[idx] = AggregatedItem(id: result[idx].id, name: result[idx].name, price: result[idx].price, quantity: result[idx].quantity, itemIds: ids, isExpense: result[idx].isExpense, menuItemId: result[idx].menuItemId)
            } else {
                result.append(AggregatedItem(id: item.id, name: item.menuItemName, price: item.price, quantity: item.quantity, itemIds: [item.id], isExpense: item.isExpense, menuItemId: item.menuItemId))
            }
        }
        return result
    }
}
