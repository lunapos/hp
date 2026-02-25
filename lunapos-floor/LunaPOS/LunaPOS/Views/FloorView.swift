import SwiftUI

// MARK: - Clock Arc

struct ClockArc: View {
    let checkInTime: Date
    let setMinutes: Int

    @State private var now = Date()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    private var elapsed: Int { checkInTime.elapsedMinutes(from: now) }
    private var remaining: Int { setMinutes - elapsed }
    private var ratio: Double { min(Double(elapsed) / Double(setMinutes), 1.0) }
    private var isOvertime: Bool { elapsed > setMinutes }
    private var isWarning: Bool { !isOvertime && remaining <= 10 }
    private var strokeColor: Color { (isOvertime || isWarning) ? .red : .lunaGoldDark }

    var body: some View {
        HStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(Color.lunaGoldDark.opacity(0.18), lineWidth: 4)
                Circle()
                    .trim(from: 0, to: ratio)
                    .stroke(strokeColor, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .rotationEffect(.degrees(-90))
            }
            .frame(width: 48, height: 48)

            VStack(alignment: .leading, spacing: 2) {
                Text(formatElapsed(elapsed))
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(strokeColor)
                if isWarning {
                    Text("残\(remaining)分")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.red)
                }
            }
        }
        .onReceive(timer) { now = $0 }
    }
}

// MARK: - Open Table Sheet

struct OpenTableSheet: View {
    let table: FloorTable
    let onOpen: (String, Int, [CastNomination], String?) -> Void
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss

    @State private var customerName = ""
    @State private var guestCount = 2
    @State private var entries: [CastEntry] = [CastEntry()]

    struct CastEntry: Identifiable {
        let id = UUID()
        var castId = ""
        var nominationType: NominationType = .none
        var isDouhan = false
    }

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
                VStack(spacing: 16) {
                    // Customer name
                    VStack(alignment: .leading, spacing: 4) {
                        Text("お客様名").font(.caption).foregroundStyle(.lunaMuted)
                        TextField("例: 田中様", text: $customerName)
                            .textFieldStyle(.roundedBorder)
                    }

                    // Guest count
                    VStack(alignment: .leading, spacing: 4) {
                        Text("人数").font(.caption).foregroundStyle(.lunaMuted)
                        HStack(spacing: 12) {
                            Button { guestCount = max(1, guestCount - 1) } label: {
                                Text("−").frame(width: 48, height: 48)
                            }
                            .buttonStyle(.bordered)

                            TextField("", value: $guestCount, format: .number)
                                .multilineTextAlignment(.center)
                                .font(.title2.bold())
                                .frame(width: 60)
                                .textFieldStyle(.roundedBorder)

                            Button { guestCount += 1 } label: {
                                Text("＋").frame(width: 48, height: 48)
                            }
                            .buttonStyle(.bordered)
                        }
                    }

                    // Cast entries
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("キャスト / 指名 / 同伴").font(.caption).foregroundStyle(.lunaMuted)
                            Spacer()
                            Button { entries.append(CastEntry()) } label: {
                                Label("追加", systemImage: "plus")
                                    .font(.caption)
                            }
                            .tint(.lunaGoldDark)
                        }

                        ForEach(entries.indices, id: \.self) { i in
                            HStack(spacing: 8) {
                                Picker("キャスト", selection: $entries[i].castId) {
                                    Text("キャスト選択").tag("")
                                    ForEach(vm.workingCasts) { c in
                                        Text(c.stageName).tag(c.id)
                                    }
                                }
                                .pickerStyle(.menu)
                                .frame(maxWidth: .infinity, alignment: .leading)

                                Picker("指名", selection: $entries[i].nominationType) {
                                    Text("なし").tag(NominationType.none)
                                    Text("場内 ¥\(Fees.nominationFeeInStore.formatted())").tag(NominationType.inStore)
                                    Text("本指名 ¥\(Fees.nominationFeeMain.formatted())").tag(NominationType.main)
                                }
                                .pickerStyle(.menu)

                                Button {
                                    // Toggle douhan, only one at a time
                                    let wasDouhan = entries[i].isDouhan
                                    for j in entries.indices { entries[j].isDouhan = false }
                                    entries[i].isDouhan = !wasDouhan
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

                                if entries.count > 1 {
                                    Button { entries.remove(at: i) } label: {
                                        Image(systemName: "xmark").font(.caption)
                                    }
                                    .tint(.lunaMuted)
                                }
                            }
                            .padding(8)
                            .background(Color.lunaCard)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        if totalFee > 0 {
                            Text("合計料金: \(totalFee.yenFormatted)")
                                .font(.caption)
                                .foregroundStyle(.lunaGoldDark)
                                .frame(maxWidth: .infinity, alignment: .trailing)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("\(table.name) — 入店受付")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("入店受付") {
                        let nominations = entries
                            .filter { !$0.castId.isEmpty && ($0.nominationType == .inStore || $0.nominationType == .main) }
                            .map { CastNomination(castId: $0.castId, nominationType: $0.nominationType) }
                        let douhanCastId = entries.first(where: { !$0.castId.isEmpty && $0.isDouhan })?.castId
                        onOpen(customerName.isEmpty ? "" : customerName, guestCount, nominations, douhanCastId)
                        dismiss()
                    }
                    .fontWeight(.bold)
                }
            }
        }
    }
}

// MARK: - Table Card

struct TableCard: View {
    let table: FloorTable
    let visit: Visit?
    let casts: [Cast]
    let setPlans: [SetPlan]

    @State private var now = Date()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    private var totalSetMins: Int { visit?.totalSetMinutes ?? 0 }
    private var elapsed: Int { visit.map { $0.checkInTime.elapsedMinutes(from: now) } ?? 0 }
    private var remaining: Int { totalSetMins - elapsed }
    private var isWarning: Bool { visit != nil && remaining <= 10 && remaining >= 0 }
    private var isOvertime: Bool { visit != nil && elapsed > totalSetMins }

    private var cardTotal: Int {
        guard let visit else { return 0 }
        return PriceCalculator.total(visit: visit, setPlans: setPlans)
    }

    private var statusColor: Color {
        switch table.status {
        case .empty: .lunaLavender
        case .occupied: .green
        case .waitingCheckout: .orange
        }
    }

    private var bgColor: Color {
        switch table.status {
        case .empty: .white
        case .occupied: Color.green.opacity(0.08)
        case .waitingCheckout: Color.orange.opacity(0.08)
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(table.name)
                    .font(.system(size: 16, weight: .bold))
                    .lineLimit(1)
                Spacer()
                Circle().fill(statusColor).frame(width: 8, height: 8)
            }

            if let visit {
                // Time & guests
                HStack(spacing: 6) {
                    Text("\(visit.checkInTime.hhMM) → \(exitTime(checkIn: visit.checkInTime, setMinutes: totalSetMins))")
                    Text("·")
                    Image(systemName: "person").font(.system(size: 9))
                    Text("\(visit.guestCount)")

                    if let first = visit.nominations.first,
                       let cast = casts.first(where: { $0.id == first.castId }) {
                        Image(systemName: "sparkles").font(.system(size: 8))
                        Text(cast.stageName + (visit.nominations.count > 1 ? "+\(visit.nominations.count - 1)" : ""))
                            .lineLimit(1)
                    }
                }
                .font(.system(size: 11))
                .foregroundStyle(.secondary)

                ClockArc(checkInTime: visit.checkInTime, setMinutes: totalSetMins)

                Text(cardTotal.yenFormatted)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(.lunaGoldDark)
            } else {
                Text("空席")
                    .font(.caption)
                    .foregroundStyle(.lunaLight)
                    .padding(.top, 8)
            }
        }
        .padding(12)
        .frame(width: 220, height: 196, alignment: .topLeading)
        .background(bgColor)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke((isWarning || isOvertime) ? Color.red.opacity(0.6) : Color.lunaBorder, lineWidth: (isWarning || isOvertime) ? 2 : 1)
        )
        .onReceive(timer) { now = $0 }
    }
}

// MARK: - Floor View

struct FloorView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var selectedTable: FloorTable?
    @State private var showOpenSheet = false
    @State private var currentRoomIndex = 0
    @Binding var selectedTableId: String?
    @Binding var showCheckout: Bool

    var body: some View {
        VStack(spacing: 0) {
            roomTabsBar
            floorContent
        }
        .sheet(isPresented: $showOpenSheet) {
            if let table = selectedTable {
                OpenTableSheet(table: table) { name, count, noms, douhan in
                    vm.openTable(
                        tableId: table.id,
                        customerName: name.isEmpty ? nil : name,
                        guestCount: count,
                        nominations: noms,
                        douhanCastId: douhan
                    )
                }
                .environment(vm)
            }
        }
    }

    private var roomTabsBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(vm.rooms.indices, id: \.self) { i in
                    roomTabButton(index: i)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
        }
        .background(Color.lunaDark)
    }

    private func roomTabButton(index i: Int) -> some View {
        let isSelected = i == currentRoomIndex
        return Button {
            withAnimation { currentRoomIndex = i }
        } label: {
            Text(vm.rooms[i].name)
                .font(.system(size: 14, weight: .semibold))
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(isSelected ? Color.lunaGold.opacity(0.2) : Color.lunaDarkBorder)
                .foregroundStyle(isSelected ? Color.lunaGold : Color.lunaSubtle)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isSelected ? Color.lunaGold.opacity(0.5) : Color.lunaDarkLight, lineWidth: 1)
                )
        }
    }

    private var floorContent: some View {
        TabView(selection: $currentRoomIndex) {
            ForEach(vm.rooms.indices, id: \.self) { i in
                roomContent(room: vm.rooms[i])
                    .tag(i)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .background(Color.lunaBg)
    }

    @ViewBuilder
    private func roomContent(room: Room) -> some View {
        let roomTables = vm.tables.filter { $0.roomId == room.id }

        if roomTables.isEmpty {
            emptyRoomView
        } else {
            populatedRoomView(tables: roomTables)
        }
    }

    private var emptyRoomView: some View {
        VStack(spacing: 8) {
            Text("テーブルがありません").font(.subheadline)
            Text("管理画面でテーブルを割り当ててください").font(.caption)
        }
        .foregroundStyle(Color.lunaLight)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func populatedRoomView(tables roomTables: [FloorTable]) -> some View {
        let maxX = roomTables.map(\.position.x).max() ?? 1
        let maxY = roomTables.map(\.position.y).max() ?? 1
        let containerW = CGFloat(32 + maxX * 220 + (maxX - 1) * 12)
        let containerH = CGFloat(32 + maxY * 196 + (maxY - 1) * 12)

        return ScrollView([.horizontal, .vertical]) {
            ZStack(alignment: .topLeading) {
                Color.clear.frame(width: containerW, height: containerH)

                ForEach(roomTables) { table in
                    tableButton(table: table)
                }
            }
        }
    }

    private func tableButton(table: FloorTable) -> some View {
        let visit = table.visitId.flatMap { vid in vm.visits.first(where: { $0.id == vid }) }
        let left = CGFloat(16 + (table.position.x - 1) * (220 + 12))
        let top = CGFloat(16 + (table.position.y - 1) * (196 + 12))

        return Button {
            if table.status == .empty {
                selectedTable = table
                showOpenSheet = true
            } else {
                selectedTableId = table.id
            }
        } label: {
            TableCard(
                table: table,
                visit: visit,
                casts: vm.casts,
                setPlans: vm.setPlans
            )
        }
        .buttonStyle(.plain)
        .position(x: left + 110, y: top + 98)
    }
}
