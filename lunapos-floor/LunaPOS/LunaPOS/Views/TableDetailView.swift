import SwiftUI

// MARK: - Active Category

enum ActiveCategory: Hashable {
    case menu(MenuCategory)
    case expense

    var label: String {
        switch self {
        case .menu(let cat): cat.label
        case .expense: "建て替え"
        }
    }

    static let all: [ActiveCategory] = MenuCategory.allCases.map { .menu($0) } + [.expense]
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
            if e.nominationType == .main { fee += Fees.nominationFeeMain }
            if e.nominationType == .inStore { fee += Fees.nominationFeeInStore }
            if e.isDouhan { fee += Fees.douhanFee }
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
                                Text(entries[i].isDouhan ? "同伴 ¥\(Fees.douhanFee.formatted())" : "同伴")
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

// MARK: - Extension Sheet

struct ExtensionSheet: View {
    let visit: Visit
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss
    @State private var perPerson = 5000

    private var totalPrice: Int { perPerson * visit.guestCount }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                HStack(spacing: 16) {
                    Text("30分延長")
                        .font(.title2.bold())
                        .foregroundStyle(.lunaGold)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.lunaDark)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    Text("\(visit.guestCount)名").foregroundStyle(.lunaMuted)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("1名あたりの料金").font(.caption).foregroundStyle(.lunaMuted)
                    HStack {
                        Text("¥").foregroundStyle(.lunaMuted).fontWeight(.semibold)
                        TextField("金額", value: $perPerson, format: .number)
                            .font(.title.bold())
                            .keyboardType(.numberPad)
                        Text("/ 名").font(.caption).foregroundStyle(.lunaMuted)
                    }
                    .padding()
                    .background(Color.lunaCard)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                HStack {
                    Text("¥\(perPerson.formatted()) × \(visit.guestCount)名")
                        .font(.subheadline)
                        .foregroundStyle(.lunaMuted)
                    Spacer()
                    Text(totalPrice.yenFormatted)
                        .font(.title.bold())
                        .foregroundStyle(.lunaGoldDark)
                }
                .padding()
                .background(Color.lunaDark.opacity(0.05))
                .clipShape(RoundedRectangle(cornerRadius: 12))

                Button {
                    vm.addExtension(visitId: visit.id, minutes: 30, price: totalPrice)
                    dismiss()
                } label: {
                    Text("延長する")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .font(.headline)
                }
                .buttonStyle(.borderedProminent)
                .tint(.lunaDark)

                Spacer()
            }
            .padding()
            .navigationTitle("延長")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium])
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
    @State private var showNomSheet = false
    @State private var showExtSheet = false
    @State private var customName = ""
    @State private var customPrice = ""
    @State private var editingPriceKey: String?
    @State private var editingPriceValue = ""

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
        let breakdown = PriceCalculator.calculate(visit: visit, setPlans: vm.setPlans)
        let total = max(0, breakdown.chargedAmount) + breakdown.expenseTotal
        let elapsedMins = visit.checkInTime.elapsedMinutes()
        let isOvertime = elapsedMins >= visit.totalSetMinutes

        HStack(spacing: 0) {
            menuPane(visit: visit)
            orderSlipPane(visit: visit, breakdown: breakdown, total: total)
        }
        .background(Color.lunaBg)
        .toolbar {
            ToolbarItem(placement: .principal) {
                tableToolbarTitle(table: table, visit: visit)
            }
            ToolbarItemGroup(placement: .primaryAction) {
                tableToolbarActions(table: table, isOvertime: isOvertime)
            }
        }
        .toolbarBackground(Color.lunaDark, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .sheet(isPresented: $showMoveSheet) {
            MoveTableSheet(currentTableId: tableId) { toId in
                vm.moveVisit(fromTableId: tableId, toTableId: toId)
                selectedTableId = toId
            }
            .environment(vm)
        }
        .sheet(isPresented: $showNomSheet) {
            NominationEditSheet(
                visitId: visit.id,
                currentNominations: visit.nominations,
                currentDouhanCastId: visit.douhanCastId
            )
            .environment(vm)
        }
        .sheet(isPresented: $showExtSheet) {
            ExtensionSheet(visit: visit)
                .environment(vm)
        }
    }

    // MARK: - Menu Pane (Left)

    private func menuPane(visit: Visit) -> some View {
        VStack(spacing: 0) {
            categoryTabsBar
            menuGridContent(visit: visit)
        }
    }

    private var categoryTabsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(ActiveCategory.all, id: \.self) { cat in
                    Button {
                        activeCategory = cat
                    } label: {
                        Text(cat.label)
                            .font(.system(size: 14, weight: .semibold))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(activeCategory == cat ? Color.lunaDark : .white)
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
                if case .expense = activeCategory {
                    Text("サービス料・消費税なし（立替）")
                        .font(.caption)
                        .foregroundStyle(.lunaMuted)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)
                } else if case .menu(let cat) = activeCategory {
                    menuItemsGrid(visit: visit, category: cat)
                }

                customItemForm(visit: visit)
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
                    .background(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaBorder))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal)
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
                Text("ORDER").font(.caption.bold()).foregroundStyle(.lunaMuted).tracking(2)
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.white)
            .overlay(alignment: .bottom) { Divider() }

            orderItemsList(visit: visit, breakdown: breakdown)

            orderTotalsSection(breakdown: breakdown, total: total)
        }
        .frame(width: 320)
        .background(.white)
        .overlay(alignment: .leading) { Divider() }
    }

    private func orderItemsList(visit: Visit, breakdown: PriceCalculator.Breakdown) -> some View {
        ScrollView {
            VStack(spacing: 4) {
                orderRow(
                    label: "セット (\(visit.setMinutes)分)",
                    qty: visit.guestCount,
                    price: breakdown.setPrice,
                    priceKey: "set",
                    onDecrement: { vm.updateGuestCount(visitId: visit.id, count: visit.guestCount - 1) },
                    onIncrement: { vm.updateGuestCount(visitId: visit.id, count: visit.guestCount + 1) }
                )

                nominationRows(visit: visit)
                douhanRow(visit: visit)
                regularItemRows(visit: visit)
                expenseItemRows(visit: visit)
            }
            .padding(8)
        }
        .background(.white)
    }

    @ViewBuilder
    private func nominationRows(visit: Visit) -> some View {
        ForEach(visit.nominations.indices, id: \.self) { i in
            let n = visit.nominations[i]
            if n.nominationType != .none {
                let unitFee = PriceCalculator.nominationFee(for: n, overrides: visit.nominationFeeOverrides)
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
            let douhanUnitFee = visit.douhanFeeOverride ?? Fees.douhanFee
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
    private func regularItemRows(visit: Visit) -> some View {
        let aggregated = aggregateItems(visit.orderItems.filter { !$0.isExpense })
        ForEach(aggregated) { item in
            orderItemRow(visitId: visit.id, item: item)
        }
    }

    @ViewBuilder
    private func expenseItemRows(visit: Visit) -> some View {
        let expenseAgg = aggregateItems(visit.orderItems.filter { $0.isExpense })
        if !expenseAgg.isEmpty {
            HStack(spacing: 4) {
                Image(systemName: "receipt").font(.system(size: 9))
                Text("建て替え").font(.caption2)
            }
            .foregroundStyle(.orange.opacity(0.7))
            .padding(.horizontal, 8)
            .padding(.top, 4)

            ForEach(expenseAgg) { item in
                orderItemRow(visitId: visit.id, item: item, isExpense: true)
            }
        }

        let regularAgg = aggregateItems(visit.orderItems.filter { !$0.isExpense })
        if regularAgg.isEmpty && expenseAgg.isEmpty {
            Text("まだオーダーなし")
                .font(.caption)
                .foregroundStyle(.lunaLight)
                .padding(.vertical, 20)
        }
    }

    private func orderTotalsSection(breakdown: PriceCalculator.Breakdown, total: Int) -> some View {
        VStack(spacing: 4) {
            Divider()
            HStack {
                Text("小計").font(.caption).foregroundStyle(.lunaMuted)
                Spacer()
                Text(breakdown.subtotal.yenFormatted).font(.caption)
            }
            if breakdown.expenseTotal > 0 {
                HStack {
                    Text("建て替え").font(.caption).foregroundStyle(.orange.opacity(0.7))
                    Spacer()
                    Text(breakdown.expenseTotal.yenFormatted).font(.caption).foregroundStyle(.orange.opacity(0.7))
                }
            }
            HStack {
                Text("サービス料 (40%)").font(.caption).foregroundStyle(.lunaMuted)
                Spacer()
                Text(breakdown.serviceFee.yenFormatted).font(.caption)
            }
            HStack {
                Text("消費税 (10%)").font(.caption).foregroundStyle(.lunaMuted)
                Spacer()
                Text(breakdown.tax.yenFormatted).font(.caption)
            }
            Divider()
            HStack {
                Text("合計").font(.headline).foregroundStyle(.lunaGoldDark)
                Spacer()
                Text(total.yenFormatted).font(.headline.bold()).foregroundStyle(.lunaGoldDark)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.white)
    }

    // MARK: - Toolbar Content

    private func tableToolbarTitle(table: FloorTable, visit: Visit) -> some View {
        HStack(spacing: 8) {
            Text(table.name).font(.headline).foregroundStyle(.lunaGold)
            if let name = visit.customerName, !name.isEmpty {
                Text("·").foregroundStyle(.lunaDarkBorder)
                Text(name).foregroundStyle(.white)
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

    @ViewBuilder
    private func tableToolbarActions(table: FloorTable, isOvertime: Bool) -> some View {
        Button { showNomSheet = true } label: {
            Label("指名", systemImage: "sparkles")
        }

        Button { showMoveSheet = true } label: {
            Label("卓移動", systemImage: "arrow.left.arrow.right")
        }

        if isOvertime {
            Button { showExtSheet = true } label: {
                Label("延長", systemImage: "timer")
            }
            .tint(.red)
        }

        Button {
            vm.updateTableStatus(tableId: table.id, status: .waitingCheckout)
            showCheckout = true
        } label: {
            Label("会計", systemImage: "creditcard")
        }
        .tint(.lunaGold)
    }

    // MARK: - Order Row

    @ViewBuilder
    private func orderRow(label: String, qty: Int, price: Int, priceKey: String, onDecrement: @escaping () -> Void, onIncrement: @escaping () -> Void) -> some View {
        HStack(spacing: 4) {
            Text(label)
                .font(.caption)
                .lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 4) {
                Button { onDecrement() } label: {
                    Image(systemName: "minus")
                        .font(.system(size: 9))
                        .frame(width: 20, height: 20)
                        .background(.white)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.lunaBorder))
                }
                .buttonStyle(.plain)

                Text("\(qty)")
                    .font(.caption.bold())
                    .frame(width: 16)

                Button { onIncrement() } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 9))
                        .frame(width: 20, height: 20)
                        .background(.white)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.lunaBorder))
                }
                .buttonStyle(.plain)
            }
            .frame(width: 64)

            priceButton(key: priceKey, price: price, onConfirm: { newPrice in
                switch priceKey {
                case "set":
                    if let v = visit { vm.updateSetPrice(visitId: v.id, price: newPrice) }
                case "douhan":
                    if let v = visit { vm.updateDouhanFee(visitId: v.id, fee: newPrice) }
                default:
                    if priceKey.hasPrefix("nom_"), let v = visit {
                        let castId = String(priceKey.dropFirst(4))
                        vm.updateNominationFee(visitId: v.id, castId: castId, fee: newPrice)
                    }
                }
            })
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 8)
        .background(Color.lunaCard)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    @ViewBuilder
    private func orderItemRow(visitId: String, item: AggregatedItem, isExpense: Bool = false) -> some View {
        HStack(spacing: 4) {
            Text(item.name)
                .font(.caption)
                .lineLimit(1)
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 4) {
                Button {
                    if let last = item.itemIds.last {
                        vm.removeOrderItem(visitId: visitId, itemId: last)
                    }
                } label: {
                    Image(systemName: item.quantity == 1 ? "trash" : "minus")
                        .font(.system(size: 9))
                        .frame(width: 20, height: 20)
                        .background(.white)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(isExpense ? Color.orange.opacity(0.3) : Color.lunaBorder))
                }
                .buttonStyle(.plain)

                Text("\(item.quantity)")
                    .font(.caption.bold())
                    .frame(width: 16)

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
                        .font(.system(size: 9))
                        .frame(width: 20, height: 20)
                        .background(.white)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(isExpense ? Color.orange.opacity(0.3) : Color.lunaBorder))
                }
                .buttonStyle(.plain)
            }
            .frame(width: 64)

            priceButton(key: item.id, price: item.price, onConfirm: { newPrice in
                for itemId in item.itemIds {
                    vm.updateOrderItemPrice(visitId: visitId, itemId: itemId, price: newPrice)
                }
            })
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
                Text("¥").font(.system(size: 10)).foregroundStyle(.lunaMuted)
                TextField("", text: $editingPriceValue)
                    .font(.caption.bold())
                    .frame(width: 56)
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
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 20, height: 20)
                        .background(Color.lunaGoldDark)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
            .frame(width: 96, alignment: .trailing)
        } else {
            Button {
                editingPriceKey = key
                editingPriceValue = "\(price)"
            } label: {
                Text(price.yenFormatted)
                    .font(.caption.bold())
            }
            .buttonStyle(.plain)
            .frame(width: 96, alignment: .trailing)
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
