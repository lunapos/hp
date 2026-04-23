import SwiftUI

// MARK: - Clock Border (角丸の縁に沿った時間アーク)

struct ClockBorder: Shape {
    var progress: Double
    var cornerRadius: CGFloat = 12

    var animatableData: Double {
        get { progress }
        set { progress = newValue }
    }

    func path(in rect: CGRect) -> Path {
        let cr = min(cornerRadius, min(rect.width, rect.height) / 2)

        // 上中央から時計回りに角丸の縁をトレース
        var full = Path()
        let topCenter = CGPoint(x: rect.midX, y: rect.minY)

        full.move(to: topCenter)
        // 上辺: 中央→右
        full.addLine(to: CGPoint(x: rect.maxX - cr, y: rect.minY))
        // 右上角丸
        full.addArc(center: CGPoint(x: rect.maxX - cr, y: rect.minY + cr),
                    radius: cr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
        // 右辺
        full.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - cr))
        // 右下角丸
        full.addArc(center: CGPoint(x: rect.maxX - cr, y: rect.maxY - cr),
                    radius: cr, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
        // 下辺
        full.addLine(to: CGPoint(x: rect.minX + cr, y: rect.maxY))
        // 左下角丸
        full.addArc(center: CGPoint(x: rect.minX + cr, y: rect.maxY - cr),
                    radius: cr, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
        // 左辺
        full.addLine(to: CGPoint(x: rect.minX, y: rect.minY + cr))
        // 左上角丸
        full.addArc(center: CGPoint(x: rect.minX + cr, y: rect.minY + cr),
                    radius: cr, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        // 上辺: 左→中央
        full.addLine(to: topCenter)

        return full.trimmedPath(from: 0, to: progress)
    }
}

// MARK: - Clock Arc

struct ClockArc: View {
    let checkInTime: Date
    let setMinutes: Int
    var compact: Bool = false

    @State private var now = Date()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    private var elapsed: Int { checkInTime.elapsedMinutes(from: now) }
    private var remaining: Int { setMinutes - elapsed }
    private var ratio: Double { isOvertime ? 1.0 : 1.0 - min(Double(remaining) / 60.0, 1.0) }
    private var isOvertime: Bool { elapsed > setMinutes }
    private var isWarning: Bool { !isOvertime && remaining <= 10 }
    private var strokeColor: Color { (isOvertime || isWarning) ? .red : .lunaGoldDark }
    private var endTime: Date { checkInTime.addingTimeInterval(Double(setMinutes) * 60) }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.lunaGoldDark.opacity(0.18), lineWidth: compact ? 5 : 7)
            Circle()
                .trim(from: 0, to: ratio)
                .stroke(strokeColor, style: StrokeStyle(lineWidth: compact ? 5 : 7, lineCap: .round))
                .rotationEffect(.degrees(-90))

            VStack(spacing: 1) {
                if isOvertime {
                    Text("+\(elapsed - setMinutes)")
                        .font(.system(size: compact ? 15 : 22, weight: .heavy))
                        .foregroundStyle(.red)
                    Text("分")
                        .font(.system(size: compact ? 10 : 12, weight: .bold))
                        .foregroundStyle(.red.opacity(0.7))
                } else {
                    Text("\(remaining)")
                        .font(.system(size: compact ? 18 : 28, weight: .heavy))
                        .foregroundStyle(strokeColor)
                    Text("分")
                        .font(.system(size: compact ? 10 : 12, weight: .bold))
                        .foregroundStyle(strokeColor.opacity(0.7))
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
    @Environment(\.dismiss) private var dismiss

    @State private var customerName = ""
    @State private var guestCount = 2

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                // Customer name
                VStack(alignment: .leading, spacing: 4) {
                    Text("お客様名").font(.caption).foregroundStyle(.lunaMuted)
                    TextField("例: 田中様", text: $customerName)
                        .textFieldStyle(.roundedBorder)
                        .font(.body)
                }

                // Guest count
                HStack {
                    Text("人数").font(.caption).foregroundStyle(.lunaMuted)
                    Spacer()
                    HStack(spacing: 16) {
                        Button {
                            if guestCount > 1 { guestCount -= 1 }
                        } label: {
                            Image(systemName: "minus.circle.fill")
                                .font(.title2)
                                .foregroundStyle(.lunaMuted)
                        }
                        Text("\(guestCount) 名")
                            .font(.title3.bold())
                            .frame(minWidth: 50)
                        Button {
                            guestCount += 1
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .font(.title2)
                                .foregroundStyle(.lunaGoldDark)
                        }
                    }
                }

                // Action button
                Button {
                    onOpen(customerName.isEmpty ? "" : customerName, guestCount, [], nil)
                    dismiss()
                } label: {
                    Text("入店受付")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.lunaGoldDark)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .padding(.top, 4)
            }
            .padding()
            .navigationTitle("\(table.name) — 入店受付")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
            }
        }
        .presentationDetents([.height(240)])
    }
}

// MARK: - Table Card

struct TableCard: View {
    let table: FloorTable
    let visit: Visit?
    let casts: [Cast]
    let setPlans: [SetPlan]
    var settings: StoreSettings? = nil
    var cardWidth: CGFloat = 280
    var cardHeight: CGFloat = 230

    @State private var now = Date()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    private var totalSetMins: Int { visit?.totalSetMinutes ?? 0 }
    private var elapsed: Int { visit.map { $0.checkInTime.elapsedMinutes(from: now) } ?? 0 }
    private var remaining: Int { totalSetMins - elapsed }
    private var isWarning: Bool { visit != nil && remaining <= 10 && remaining >= 0 }
    private var isOvertime: Bool { visit != nil && elapsed > totalSetMins }

    // 60分で1周。残り時間が少ないほどアークが伸びる
    // 例: 残42分 → アークは18/60=30%、残10分 → 83%、超過 → 100%
    private var timeRatio: Double {
        guard visit != nil, totalSetMins > 0 else { return 0 }
        if isOvertime { return 1.0 }
        let remainClamped = max(0, min(remaining, 60))
        return 1.0 - Double(remainClamped) / 60.0
    }

    private var arcColor: Color {
        if isOvertime { return .red }
        if isWarning { return .red }
        return .lunaGoldDark
    }

    private var cardTotal: Int {
        guard let visit else { return 0 }
        return PriceCalculator.total(visit: visit, setPlans: setPlans, settings: settings)
    }

    private var statusColor: Color {
        switch table.status {
        case .empty: .lunaLavender
        case .occupied: Color(red: 0.2, green: 0.85, blue: 0.4)
        case .waitingCheckout: Color(red: 1.0, green: 0.72, blue: 0.2)
        }
    }

    private var bgColor: Color {
        switch table.status {
        case .empty: .lunaCard
        case .occupied: Color(red: 0.08, green: 0.22, blue: 0.12)   // 深い緑系
        case .waitingCheckout: Color(red: 0.25, green: 0.18, blue: 0.06) // 琥珀系
        }
    }

    private var borderColor: Color {
        switch table.status {
        case .empty: .lunaBorder
        case .occupied: Color(red: 0.15, green: 0.45, blue: 0.25)   // 緑ボーダー
        case .waitingCheckout: Color(red: 0.50, green: 0.38, blue: 0.12) // 琥珀ボーダー
        }
    }

    private var endTime: Date? {
        visit.map { $0.checkInTime.addingTimeInterval(Double(totalSetMins) * 60) }
    }

    // Scale factor relative to base card width of 280
    private var scale: CGFloat { cardWidth / 280 }

    var body: some View {
        VStack(spacing: 0) {
            // Header: table name + status
            HStack {
                Text(table.name)
                    .font(.system(size: 24 * scale, weight: .heavy))
                    .lineLimit(1)
                Spacer()
                Circle().fill(statusColor).frame(width: 10 * scale, height: 10 * scale)
            }

            if let visit {
                Spacer(minLength: 2)

                VStack(alignment: .leading, spacing: 8 * scale) {
                    // Time + remaining
                    HStack(spacing: 5) {
                        Text(visit.checkInTime.hhMM)
                        Text("→").foregroundStyle(.secondary)
                        Text(endTime?.hhMM ?? "")
                        Spacer()
                        if isOvertime {
                            Text("+\(elapsed - totalSetMins)分")
                                .font(.system(size: 18 * scale, weight: .heavy))
                                .foregroundStyle(.red)
                        } else {
                            Text("残\(remaining)分")
                                .font(.system(size: 18 * scale, weight: .heavy))
                                .foregroundStyle(isWarning ? .red : .lunaGoldDark)
                        }
                    }
                    .font(.system(size: 18 * scale, weight: .semibold))
                    .foregroundStyle(.secondary)

                    // Guests
                    HStack(spacing: 5) {
                        Image(systemName: "person.fill").font(.system(size: 16 * scale))
                        Text("\(visit.guestCount)名")
                            .font(.system(size: 20 * scale, weight: .bold))
                    }
                    .foregroundStyle(.secondary)

                    // Nomination — 本指名優先で表示（本/場 ラベル付き）
                    let activeNoms = visit.nominations.filter { $0.nominationType != .none }
                    if !activeNoms.isEmpty {
                        let sorted = activeNoms.sorted { a, b in
                            if a.nominationType == .main && b.nominationType != .main { return true }
                            if a.nominationType != .main && b.nominationType == .main { return false }
                            return false
                        }
                        let labels = sorted.prefix(3).compactMap { n -> String? in
                            guard let name = casts.first(where: { $0.id == n.castId })?.stageName else { return nil }
                            let tag = n.nominationType == .main ? "本" : "場"
                            return "\(name)(\(tag))"
                        }
                        let extra = activeNoms.count - labels.count
                        HStack(spacing: 5) {
                            Image(systemName: "sparkles").font(.system(size: 15 * scale))
                            Text(labels.joined(separator: " ") + (extra > 0 ? " +\(extra)" : ""))
                                .font(.system(size: 18 * scale, weight: .bold))
                                .lineLimit(1)
                        }
                        .foregroundStyle(.lunaGoldDark)
                    }
                }

                Spacer(minLength: 2)

                // Total amount
                HStack {
                    Spacer()
                    Text(cardTotal.yenFormatted)
                        .font(.system(size: 32 * scale, weight: .heavy, design: .rounded))
                        .foregroundStyle(.lunaGoldDark)
                }
            } else {
                Spacer()
                Text("空席")
                    .font(.system(size: 20 * scale, weight: .medium))
                    .foregroundStyle(.lunaLight)
                    .frame(maxWidth: .infinity)
                Spacer()
            }
        }
        .padding(16 * scale)
        .frame(width: cardWidth, height: cardHeight)
        .background(bgColor)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            // ベースボーダー（全周・薄め）
            RoundedRectangle(cornerRadius: 12)
                .stroke(borderColor.opacity(0.4), lineWidth: 2)
        )
        .overlay(
            // 時間アーク（60分で1周、上中央から時計回り）
            ClockBorder(progress: visit != nil ? timeRatio : 0, cornerRadius: 12)
                .stroke(arcColor, style: StrokeStyle(lineWidth: 3.5, lineCap: .round))
        )
        .onReceive(timer) { now = $0 }
    }
}

// MARK: - Floor View

struct FloorView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var openingTable: FloorTable?
    @State private var currentRoomIndex = 0
    @Binding var selectedTableId: String?
    @Binding var showCheckout: Bool

    var body: some View {
        VStack(spacing: 0) {
            roomTabsBar
            floorContent
        }
        .sheet(item: $openingTable) { table in
            OpenTableSheet(table: table) { name, count, _, _ in
                vm.openTable(
                    tableId: table.id,
                    customerName: name.isEmpty ? nil : name,
                    guestCount: count,
                    nominations: [],
                    douhanCastId: nil
                )
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
            .padding(.vertical, 6)
        }
        .background(Color.lunaDark)
    }

    private func roomTabButton(index i: Int) -> some View {
        let isSelected = i == currentRoomIndex
        return Button {
            withAnimation { currentRoomIndex = i }
        } label: {
            Text(vm.rooms[i].name)
                .font(.system(size: 16, weight: .bold))
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
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
        // テーブル数が4以上なら4列、それ以外はDB側のposition.xの最大値を使う
        let maxX = roomTables.map(\.position.x).max() ?? 1
        let cols = roomTables.count >= 4 ? max(maxX, 4) : maxX
        let rows = max(roomTables.map(\.position.y).max() ?? 1, Int(ceil(Double(roomTables.count) / Double(cols))))
        let sorted = roomTables.sorted { a, b in
            a.position.y != b.position.y ? a.position.y < b.position.y : a.position.x < b.position.x
        }

        return GeometryReader { geo in
            let spacing: CGFloat = 8
            let padding: CGFloat = 8

            let availW = geo.size.width - padding * 2 - spacing * CGFloat(cols - 1)
            let availH = geo.size.height - padding * 2 - spacing * CGFloat(rows - 1)

            // カードサイズに上限を設定（テーブル少数時に巨大化しない）
            let maxCardW: CGFloat = 280
            let maxCardH: CGFloat = 220
            let cardW = min(availW / CGFloat(cols), maxCardW)
            let cardH = min(availH / CGFloat(rows), maxCardH)

            let columns = Array(repeating: GridItem(.fixed(cardW), spacing: spacing), count: cols)

            LazyVGrid(columns: columns, alignment: .leading, spacing: spacing) {
                ForEach(sorted) { table in
                    tableButton(table: table, cardW: cardW, cardH: cardH)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(padding)
        }
    }

    private func tableButton(table: FloorTable, cardW: CGFloat, cardH: CGFloat) -> some View {
        let visit = table.visitId.flatMap { vid in vm.visits.first(where: { $0.id == vid }) }

        return Button {
            if table.status == .empty {
                openingTable = table
            } else {
                selectedTableId = table.id
            }
        } label: {
            TableCard(
                table: table,
                visit: visit,
                casts: vm.casts,
                setPlans: vm.setPlans,
                settings: vm.storeSettings,
                cardWidth: cardW,
                cardHeight: cardH
            )
        }
        .buttonStyle(.plain)
    }
}
