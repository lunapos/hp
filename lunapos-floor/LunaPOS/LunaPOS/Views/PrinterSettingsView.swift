import SwiftUI

/// プリンタ設定画面 — 機種選択・検出・テスト印刷
struct PrinterSettingsView: View {
    @State private var printerManager = PrinterManager.shared
    @State private var isDiscovering = false
    @State private var isTesting = false
    @State private var showTestResult = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            // ヘッダー
            HStack {
                Text("プリンタ設定")
                    .font(.headline)
                    .foregroundStyle(.lunaGold)
                    .tracking(2)
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.lunaMuted)
                }
            }
            .padding()
            .background(Color.lunaDark)

            ScrollView {
                VStack(spacing: 20) {
                    printerTypeSection
                    connectionStatusSection
                    autoPrintSection

                    if printerManager.selectedType != .airprint {
                        discoveredPrintersSection
                    }

                    testPrintSection
                    sdkInfoSection
                }
                .padding()
            }
            .background(Color.lunaBg)
        }
    }

    // MARK: - プリンタ種別選択

    private var printerTypeSection: some View {
        GroupBox {
            VStack(alignment: .leading, spacing: 12) {
                Label("プリンタの種類", systemImage: "printer")
                    .font(.subheadline.bold())
                    .foregroundStyle(.lunaMuted)
                    .tracking(1)

                ForEach(PrinterType.allCases, id: \.self) { type in
                    Button {
                        printerManager.selectedType = type
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: type.icon)
                                .font(.title3)
                                .frame(width: 32)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(type.displayName)
                                    .font(.subheadline.bold())
                                Text(typeDescription(type))
                                    .font(.caption)
                                    .foregroundStyle(.lunaMuted)
                            }
                            Spacer()
                            if printerManager.selectedType == type {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.lunaGold)
                            }
                        }
                        .padding(.vertical, 8)
                        .padding(.horizontal, 12)
                        .background(printerManager.selectedType == type ? Color.lunaGold.opacity(0.1) : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - 接続ステータス

    private var connectionStatusSection: some View {
        GroupBox {
            HStack(spacing: 12) {
                statusIndicator
                VStack(alignment: .leading, spacing: 2) {
                    Text("接続状態")
                        .font(.caption)
                        .foregroundStyle(.lunaMuted)
                    Text(statusText)
                        .font(.subheadline.bold())
                }
                Spacer()
                if let error = printerManager.lastError {
                    Text(error)
                        .font(.caption2)
                        .foregroundStyle(.red)
                        .lineLimit(2)
                        .frame(maxWidth: 200)
                }
            }
        }
    }

    @ViewBuilder
    private var statusIndicator: some View {
        switch printerManager.connectionState {
        case .connected:
            Circle().fill(.green).frame(width: 12, height: 12)
        case .searching:
            ProgressView().controlSize(.small)
        case .printing:
            ProgressView().controlSize(.small).tint(.lunaGold)
        case .error:
            Circle().fill(.red).frame(width: 12, height: 12)
        case .disconnected:
            Circle().fill(.gray).frame(width: 12, height: 12)
        }
    }

    private var statusText: String {
        switch printerManager.connectionState {
        case .connected: "接続済み"
        case .searching: "検出中..."
        case .printing: "印刷中..."
        case .error: "エラー"
        case .disconnected: "未接続"
        }
    }

    // MARK: - 自動印刷

    private var autoPrintSection: some View {
        GroupBox {
            Toggle(isOn: Binding(
                get: { printerManager.autoPrintEnabled },
                set: { printerManager.autoPrintEnabled = $0 }
            )) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("会計時に自動印刷")
                        .font(.subheadline)
                    Text("会計完了時にレシートを自動印刷します")
                        .font(.caption)
                        .foregroundStyle(.lunaMuted)
                }
            }
            .tint(.lunaGold)
        }
    }

    // MARK: - 検出されたプリンタ一覧

    private var discoveredPrintersSection: some View {
        GroupBox {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("検出されたプリンタ", systemImage: "wifi")
                        .font(.subheadline.bold())
                        .foregroundStyle(.lunaMuted)
                        .tracking(1)
                    Spacer()
                    Button {
                        Task {
                            isDiscovering = true
                            await printerManager.discoverPrinters()
                            isDiscovering = false
                        }
                    } label: {
                        HStack(spacing: 4) {
                            if isDiscovering {
                                ProgressView().controlSize(.mini)
                            }
                            Text("検出")
                        }
                        .font(.caption)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.lunaDark)
                    .disabled(isDiscovering)
                }

                if printerManager.discoveredPrinters.isEmpty {
                    HStack {
                        Image(systemName: "info.circle")
                        Text("プリンタが見つかりません。電源とBluetooth/Wi-Fi接続を確認してください。")
                    }
                    .font(.caption)
                    .foregroundStyle(.lunaMuted)
                    .padding(.vertical, 8)
                } else {
                    ForEach(printerManager.discoveredPrinters) { printer in
                        Button {
                            Task { await printerManager.connect(to: printer) }
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: printer.connectionType == .bluetooth ? "wave.3.right" : "wifi")
                                    .foregroundStyle(.lunaMuted)
                                VStack(alignment: .leading) {
                                    Text(printer.name).font(.subheadline)
                                    Text(printer.id).font(.caption2).foregroundStyle(.lunaMuted)
                                }
                                Spacer()
                                if printerManager.selectedPrinterId == printer.id {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundStyle(.green)
                                }
                            }
                            .padding(.vertical, 6)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    // MARK: - テスト印刷

    private var testPrintSection: some View {
        GroupBox {
            VStack(spacing: 12) {
                Button {
                    Task {
                        isTesting = true
                        await printerManager.testPrint()
                        isTesting = false
                        showTestResult = true
                    }
                } label: {
                    HStack(spacing: 8) {
                        if isTesting {
                            ProgressView().tint(.lunaDark)
                        } else {
                            Image(systemName: "printer.dotmatrix")
                        }
                        Text(isTesting ? "テスト印刷中..." : "テスト印刷")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
                .buttonStyle(.borderedProminent)
                .tint(.lunaGold)
                .disabled(isTesting)

                if showTestResult {
                    if printerManager.lastError == nil {
                        Label("テスト印刷が完了しました", systemImage: "checkmark.circle")
                            .font(.caption)
                            .foregroundStyle(.green)
                    } else {
                        Label("テスト印刷に失敗しました", systemImage: "exclamationmark.triangle")
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }
            }
        }
    }

    // MARK: - SDK情報

    private var sdkInfoSection: some View {
        GroupBox {
            VStack(alignment: .leading, spacing: 8) {
                Label("SDK情報", systemImage: "info.circle")
                    .font(.subheadline.bold())
                    .foregroundStyle(.lunaMuted)
                    .tracking(1)

                VStack(alignment: .leading, spacing: 4) {
                    sdkStatusRow("AirPrint", available: true)
                    #if STAR_SDK_AVAILABLE
                    sdkStatusRow("StarIO10 SDK", available: true)
                    #else
                    sdkStatusRow("StarIO10 SDK", available: false)
                    #endif
                    #if EPSON_SDK_AVAILABLE
                    sdkStatusRow("Epson ePOS SDK", available: true)
                    #else
                    sdkStatusRow("Epson ePOS SDK", available: false)
                    #endif
                }
            }
        }
    }

    private func sdkStatusRow(_ name: String, available: Bool) -> some View {
        HStack(spacing: 8) {
            Image(systemName: available ? "checkmark.circle.fill" : "xmark.circle")
                .foregroundStyle(available ? .green : .lunaMuted)
                .font(.caption)
            Text(name).font(.caption)
            Spacer()
            Text(available ? "利用可能" : "未導入")
                .font(.caption2)
                .foregroundStyle(available ? .green : .lunaMuted)
        }
    }

    // MARK: - ヘルパー

    private func typeDescription(_ type: PrinterType) -> String {
        switch type {
        case .airprint: "iPad標準。SDK不要、ほぼ全てのプリンタに対応"
        case .star: "Star TSP100IV / mC-Print3 / SM-L200 等"
        case .epson: "Epson TM-m30 / TM-T88 等"
        }
    }
}
