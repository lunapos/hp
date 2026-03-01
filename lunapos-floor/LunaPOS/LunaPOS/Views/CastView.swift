import SwiftUI

// MARK: - Add Cast Sheet

struct AddCastSheet: View {
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
                            realName: realName.trimmingCharacters(in: .whitespaces),
                            photo: nil,
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
        }
    }
}

// MARK: - Cast Detail Sheet

struct CastDetailSheet: View {
    let cast: Cast
    @Environment(AppViewModel.self) private var vm
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Avatar + Name
                HStack(alignment: .top, spacing: 16) {
                    avatarView(cast: cast, size: 80)

                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Text(cast.stageName).font(.title2.bold())
                            Circle()
                                .fill(cast.isWorking ? .green : .lunaLavender)
                                .frame(width: 8, height: 8)
                        }
                        if !cast.realName.isEmpty {
                            Text(cast.realName).font(.subheadline).foregroundStyle(.lunaMuted)
                        }
                        Text(cast.isWorking ? "出勤中" : "未出勤")
                            .font(.caption.bold())
                            .foregroundStyle(cast.isWorking ? .green : .lunaMuted)
                    }

                    Spacer()

                    Button {
                        if cast.isWorking {
                            vm.clockOut(castId: cast.id)
                        } else {
                            vm.clockIn(castId: cast.id)
                        }
                    } label: {
                        Label(cast.isWorking ? "退勤" : "出勤",
                              systemImage: cast.isWorking ? "arrow.right.square" : "arrow.left.square")
                            .font(.subheadline.bold())
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                    }
                    .buttonStyle(.bordered)
                    .tint(cast.isWorking ? .red : .green)
                }

                // Shift info
                VStack(spacing: 8) {
                    if cast.scheduledClockIn != nil || cast.scheduledClockOut != nil {
                        HStack(spacing: 8) {
                            Image(systemName: "calendar").font(.caption).foregroundStyle(.lunaMuted)
                            Text("シフト予定").font(.caption).foregroundStyle(.lunaMuted)
                            Text("\(cast.scheduledClockIn ?? "--:--") 〜 \(cast.scheduledClockOut ?? "--:--")")
                                .font(.subheadline.bold())
                            Spacer()
                        }
                    }

                    HStack(spacing: 8) {
                        Image(systemName: "clock").font(.caption).foregroundStyle(.lunaMuted)
                        Text("出勤").font(.caption).foregroundStyle(.lunaMuted)
                        Text(cast.clockInTime?.hhMM ?? "--:--").font(.subheadline.bold())
                        if let out = cast.clockOutTime {
                            Text("〜").foregroundStyle(.lunaMuted)
                            Text(out.hhMM).font(.subheadline.bold())
                        }
                        Spacer()
                    }

                    if let loc = cast.dropOffLocation {
                        HStack(spacing: 8) {
                            Image(systemName: "mappin").font(.caption).foregroundStyle(.lunaMuted)
                            Text("送り先").font(.caption).foregroundStyle(.lunaMuted)
                            Text(loc).font(.subheadline.bold())
                            Spacer()
                        }
                    }
                }
                .padding()
                .background(Color.lunaCard)
                .clipShape(RoundedRectangle(cornerRadius: 12))

                // Stats
                HStack(spacing: 16) {
                    VStack {
                        Text("\(vm.castNominations(castId: cast.id))")
                            .font(.title.bold())
                        Text("指名").font(.caption).foregroundStyle(.lunaMuted)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.lunaCard)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    VStack {
                        Text(vm.castSales(castId: cast.id).yenFormatted)
                            .font(.headline.bold())
                            .foregroundStyle(.lunaGoldDark)
                        Text("売上").font(.caption).foregroundStyle(.lunaMuted)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.lunaCard)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Spacer()
            }
            .padding()
            .navigationTitle("キャスト詳細")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                }
            }
        }
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
    @State private var selectedCast: Cast?
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
                            Button { selectedCast = cast } label: {
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
        .sheet(item: $selectedCast) { cast in
            // Re-fetch to get latest state
            let latest = vm.casts.first(where: { $0.id == cast.id }) ?? cast
            CastDetailSheet(cast: latest).environment(vm)
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

