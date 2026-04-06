import SwiftUI

// MARK: - Add Cast Sheet

struct AddCastSheet: View {
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss

    @State private var stageName = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("基本情報") {
                    TextField("源氏名 *", text: $stageName)
                }
            }
            .navigationTitle("キャスト追加")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("追加する") {
                        vm.addCast(
                            stageName: stageName.trimmingCharacters(in: .whitespaces),
                            realName: "",
                            photo: nil,
                            scheduledClockIn: nil,
                            scheduledClockOut: nil,
                            dropOffLocation: nil
                        )
                        dismiss()
                    }
                    .fontWeight(.bold)
                    .disabled(stageName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}

// MARK: - Cast Detail Sheet

struct CastDetailSheet: View {
    let cast: Cast
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss
    @State private var dropOff = ""
    @State private var dropOffSaved = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Avatar + Name + 出退勤ボタン
                    HStack(alignment: .center, spacing: 20) {
                        avatarView(cast: cast, size: 100)

                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 10) {
                                Text(cast.stageName).font(.title.bold())
                                Circle()
                                    .fill(cast.isWorking ? .green : .lunaLavender)
                                    .frame(width: 10, height: 10)
                            }
                            if !cast.realName.isEmpty {
                                Text(cast.realName).font(.body).foregroundStyle(.lunaMuted)
                            }
                            Text(cast.isWorking ? "出勤中" : "未出勤")
                                .font(.subheadline.bold())
                                .foregroundStyle(cast.isWorking ? .green : .lunaMuted)
                        }

                        Spacer()

                        Button {
                            if cast.isWorking {
                                vm.clockOut(castId: cast.id)
                            } else {
                                vm.clockIn(castId: cast.id)
                            }
                            dismiss()
                        } label: {
                            Label(cast.isWorking ? "退勤" : "出勤",
                                  systemImage: cast.isWorking ? "arrow.right.square" : "arrow.left.square")
                                .font(.title3.bold())
                                .padding(.horizontal, 24)
                                .padding(.vertical, 14)
                        }
                        .buttonStyle(.bordered)
                        .tint(cast.isWorking ? .red : .green)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)

                    // 出勤時刻・シフト情報
                    VStack(spacing: 0) {
                        if cast.scheduledClockIn != nil || cast.scheduledClockOut != nil {
                            infoRow(
                                icon: "calendar",
                                label: "シフト予定",
                                value: "\(cast.scheduledClockIn ?? "--:--") 〜 \(cast.scheduledClockOut ?? "--:--")"
                            )
                            Divider().padding(.leading, 20)
                        }

                        infoRow(
                            icon: "clock",
                            label: "出勤",
                            value: {
                                let inTime = cast.clockInTime?.hhMM ?? "--:--"
                                if let out = cast.clockOutTime {
                                    return "\(inTime) 〜 \(out.hhMM)"
                                }
                                return inTime
                            }()
                        )
                    }
                    .background(Color.lunaCard)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .padding(.horizontal, 20)

                    // 送り先セクション
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 8) {
                            Image(systemName: "mappin").foregroundStyle(.lunaMuted)
                            Text("送り先").font(.subheadline).foregroundStyle(.lunaMuted)
                            if cast.isTodayOverride {
                                Text("本日変更あり")
                                    .font(.caption.bold())
                                    .foregroundStyle(.lunaGoldDark)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(Color.lunaGoldDark.opacity(0.15))
                                    .clipShape(Capsule())
                            }
                            Spacer()
                            if dropOffSaved {
                                Label("確定済み", systemImage: "checkmark.circle.fill")
                                    .font(.caption.bold())
                                    .foregroundStyle(.green)
                            }
                        }

                        HStack(spacing: 12) {
                            TextField("最寄り駅を入力", text: $dropOff)
                                .font(.title3)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 12)
                                .background(Color.lunaBg)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .onSubmit { saveDropOff() }
                                .onChange(of: dropOff) { _, _ in
                                    // テキストが変わったら「確定済み」表示を外す
                                    if dropOffSaved {
                                        dropOffSaved = false
                                    }
                                }

                            Button {
                                saveDropOff()
                            } label: {
                                Text(dropOffSaved ? "変更する" : "確定")
                                    .font(.title3.bold())
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 12)
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(dropOffSaved ? .lunaDark : .green)
                        }
                    }
                    .padding(20)
                    .background(Color.lunaCard)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .padding(.horizontal, 20)

                    // 指名・売上
                    HStack(spacing: 16) {
                        statCard(
                            value: "\(vm.castNominations(castId: cast.id))",
                            label: "指名",
                            valueFont: .system(size: 44, weight: .bold),
                            valueColor: .primary
                        )
                        statCard(
                            value: vm.castSales(castId: cast.id).yenFormatted,
                            label: "売上",
                            valueFont: .title2.bold(),
                            valueColor: .lunaGoldDark
                        )
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                }
            }
            .background(Color.lunaBg)
            .navigationTitle("キャスト詳細")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                }
            }
            .onAppear {
                dropOff = cast.effectiveDropOffLocation ?? ""
                dropOffSaved = cast.dropOffConfirmed
            }
        }
    }

    private func saveDropOff() {
        let value = dropOff.trimmingCharacters(in: .whitespaces)
        vm.updateCastDropOff(castId: cast.id, dropOff: value.isEmpty ? nil : value)
        dropOff = value
        dropOffSaved = true
    }

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(.lunaMuted)
                .frame(width: 24)
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.lunaMuted)
            Spacer()
            Text(value)
                .font(.title3.bold())
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
    }

    private func statCard(value: String, label: String, valueFont: Font, valueColor: Color) -> some View {
        VStack(spacing: 6) {
            Text(value)
                .font(valueFont)
                .foregroundStyle(valueColor)
                .minimumScaleFactor(0.7)
                .lineLimit(1)
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.lunaMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .background(Color.lunaCard)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Edit Cast Sheet

struct EditCastSheet: View {
    let cast: Cast
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss

    @State private var stageName = ""
    @State private var realName = ""
    @State private var scheduledClockIn = ""
    @State private var scheduledClockOut = ""
    @State private var dropOffLocation = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("基本情報") {
                    TextField("源氏名 *", text: $stageName)
                    TextField("本名", text: $realName)
                }
                Section("シフト") {
                    TextField("出勤予定 (例: 19:00)", text: $scheduledClockIn)
                    TextField("退勤予定 (例: 24:00)", text: $scheduledClockOut)
                }
                Section("その他") {
                    TextField("送り先", text: $dropOffLocation)
                }
            }
            .navigationTitle("キャスト編集")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        vm.updateCast(
                            id: cast.id,
                            stageName: stageName.trimmingCharacters(in: .whitespaces),
                            realName: realName.trimmingCharacters(in: .whitespaces),
                            photo: cast.photo,
                            scheduledClockIn: scheduledClockIn.isEmpty ? nil : scheduledClockIn,
                            scheduledClockOut: scheduledClockOut.isEmpty ? nil : scheduledClockOut,
                            dropOffLocation: dropOffLocation.isEmpty ? nil : dropOffLocation
                        )
                        dismiss()
                    }
                    .fontWeight(.bold)
                    .disabled(stageName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear {
                stageName = cast.stageName
                realName = cast.realName
                scheduledClockIn = cast.scheduledClockIn ?? ""
                scheduledClockOut = cast.scheduledClockOut ?? ""
                dropOffLocation = cast.dropOffLocation ?? ""
            }
        }
    }
}

// MARK: - Avatar View

func avatarView(cast: Cast, size: CGFloat) -> some View {
    Group {
        if let name = cast.photo, let uiImage = UIImage(named: name) {
            Image(uiImage: uiImage)
                .resizable()
                .scaledToFill()
                .frame(width: size, height: size)
                .clipShape(Circle())
                .overlay(Circle().stroke(Color.lunaBorder, lineWidth: 1.5))
        } else {
            initialAvatar(name: cast.stageName, size: size)
        }
    }
}

private func initialAvatar(name: String, size: CGFloat) -> some View {
    Circle()
        .fill(Color.lunaCard)
        .frame(width: size, height: size)
        .overlay(
            Text(String(name.prefix(1)))
                .font(.system(size: size * 0.4, weight: .semibold))
                .foregroundStyle(.lunaMuted)
        )
        .overlay(Circle().stroke(Color.lunaBorder))
}

// MARK: - Cast View

struct CastView: View {
    @Environment(AppViewModel.self) private var vm
    @State private var showAdd = false
    @State private var selectedCastId: String?
    @State private var now = Date()

    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    private var sortedCasts: [Cast] {
        vm.casts.sorted { a, b in
            if a.isWorking != b.isWorking { return a.isWorking }
            if a.isWorking && b.isWorking {
                return (a.clockInTime ?? .distantPast) < (b.clockInTime ?? .distantPast)
            }
            if a.scheduledClockIn != nil && b.scheduledClockIn != nil {
                return (a.scheduledClockIn ?? "") < (b.scheduledClockIn ?? "")
            }
            if a.scheduledClockIn != nil { return true }
            return false
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Cast grid
            GeometryReader { geo in
                let cols = 5
                let rows = Int(ceil(Double(sortedCasts.count) / Double(cols)))
                let spacing: CGFloat = 10
                let padding: CGFloat = 10

                let availW = geo.size.width - padding * 2 - spacing * CGFloat(cols - 1)
                let availH = geo.size.height - padding * 2 - spacing * CGFloat(max(rows - 1, 0))
                let maxCardW: CGFloat = 280
                let maxCardH: CGFloat = 280
                let cardW = min(availW / CGFloat(cols), maxCardW)
                let cardH = min(availH / CGFloat(max(rows, 1)), maxCardH)
                let avatarSize = min(cardH * 0.45, cardW * 0.5)

                let columns = Array(repeating: GridItem(.fixed(cardW), spacing: spacing), count: cols)

                ScrollView {
                    LazyVGrid(columns: columns, spacing: spacing) {
                        ForEach(sortedCasts) { cast in
                            Button { selectedCastId = cast.id } label: {
                                castCard(cast: cast, cardW: cardW, cardH: cardH, avatarSize: avatarSize)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(padding)
                }
            }
            .background(Color.lunaBg)

            // Legend
            HStack(spacing: 16) {
                legendDot(color: .green, label: "出勤中")
                legendDot(color: Color.lunaGoldDark.opacity(0.7), label: "出勤予定")
                legendDot(color: .lunaLavender, label: "休み")
            }
            .font(.caption)
            .foregroundStyle(.lunaMuted)
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color.lunaBg)
        }
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("CAST").font(.headline).foregroundStyle(.lunaGold).tracking(4)
            }
            ToolbarItemGroup(placement: .primaryAction) {
                VStack(spacing: 2) {
                    Text(now.hhMMss)
                        .font(.subheadline.bold().monospacedDigit())
                        .foregroundStyle(.white)
                    Text("出勤 \(vm.workingCasts.count) 名")
                        .font(.caption)
                        .foregroundStyle(.lunaSubtle)
                }

                Button { showAdd = true } label: {
                    Label("追加", systemImage: "plus")
                }
                .tint(.lunaGold)
            }
        }
        .toolbarBackground(Color.lunaDark, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .sheet(isPresented: $showAdd) {
            AddCastSheet().environment(vm)
        }
        .sheet(isPresented: Binding(
            get: { selectedCastId != nil },
            set: { if !$0 { selectedCastId = nil } }
        )) {
            if let cast = vm.casts.first(where: { $0.id == selectedCastId }) {
                CastDetailSheet(cast: cast).environment(vm)
            }
        }
        .onReceive(timer) { now = $0 }
    }

    private func castCard(cast: Cast, cardW: CGFloat, cardH: CGFloat, avatarSize: CGFloat) -> some View {
        VStack(spacing: 8) {
            Spacer(minLength: 0)

            ZStack(alignment: .bottomTrailing) {
                avatarView(cast: cast, size: avatarSize)

                Circle()
                    .fill(cast.isWorking ? .green : (cast.scheduledClockIn != nil ? Color.lunaGoldDark.opacity(0.7) : .lunaLavender))
                    .frame(width: 16, height: 16)
                    .overlay(Circle().stroke(.white, lineWidth: 2))
            }

            Text(cast.stageName)
                .font(.system(size: min(cardW * 0.1, 20), weight: .bold))
                .lineLimit(1)

            if cast.isWorking, let t = cast.clockInTime {
                VStack(spacing: 2) {
                    Text("\(t.hhMM)〜")
                        .font(.system(size: min(cardW * 0.08, 17), weight: .semibold))
                        .foregroundStyle(.green)
                    Text(formatElapsed(t.elapsedMinutes(from: now)))
                        .font(.system(size: min(cardW * 0.07, 15), weight: .medium))
                        .foregroundStyle(.lunaSubtle)
                }
            } else if let s = cast.scheduledClockIn {
                Text(s)
                    .font(.system(size: min(cardW * 0.08, 17)))
                    .foregroundStyle(.lunaMuted)
            }

            Spacer(minLength: 0)
        }
        .frame(width: cardW, height: cardH)
        .background(.lunaCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.lunaBorder))
    }

    @ViewBuilder
    private func legendDot(color: Color, label: String) -> some View {
        HStack(spacing: 4) {
            Circle().fill(color).frame(width: 8, height: 8)
            Text(label)
        }
    }
}

