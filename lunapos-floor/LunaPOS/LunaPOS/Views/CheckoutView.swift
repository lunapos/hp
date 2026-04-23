import SwiftUI

struct CheckoutView: View {
    let tableId: String
    @Environment(AppViewModel.self) private var vm
    @Binding var selectedTableId: String?
    @Binding var showCheckout: Bool

    @State private var paymentMethod: PaymentMethod = .cash
    @State private var discountInput = ""
    @State private var receivedInput = "" // 預かり金額（現金時）
    @State private var completed = false
    @State private var completedTotal = 0
    @State private var completedChange = 0 // お釣り（現金時）
    @State private var showTabWarning = false // ツケ時の顧客未選択警告
    @State private var showReceipt = false // レシートプレビュー
    @State private var completedReceipt: ReceiptData? // 会計完了時のレシートデータ

    private var table: FloorTable? { vm.tables.first(where: { $0.id == tableId }) }
    private var visit: Visit? { table?.visitId.flatMap { vid in vm.visits.first(where: { $0.id == vid }) } }

    var body: some View {
        if completed {
            completedView
        } else if let table, let visit {
            checkoutContent(table: table, visit: visit)
        } else {
            VStack {
                Text("テーブルが見つかりません").foregroundStyle(.lunaMuted)
                Button("フロアへ戻る") {
                    showCheckout = false
                    selectedTableId = nil
                }
                .tint(.lunaGoldDark)
            }
        }
    }

    // MARK: - Completed View

    private var completedView: some View {
        VStack(spacing: 0) {
            Spacer()
            Image(systemName: "checkmark")
                .font(.system(size: 44))
                .foregroundStyle(.lunaGold)
                .frame(width: 100, height: 100)
                .background(Color.lunaDark)
                .clipShape(Circle())
                .padding(.bottom, 24)

            Text("THANK YOU")
                .font(.largeTitle.bold())
                .tracking(6)
                .padding(.bottom, 12)

            Text(completedTotal.yenFormatted)
                .font(.system(size: 36, weight: .bold))
                .foregroundStyle(.lunaGoldDark)

            if completedChange > 0 {
                VStack(spacing: 4) {
                    Text("お釣り")
                        .font(.subheadline)
                        .foregroundStyle(.lunaMuted)
                    Text(completedChange.yenFormatted)
                        .font(.title2.bold())
                        .foregroundStyle(.white)
                }
                .padding(.top, 12)
            }

            Spacer()

            HStack(spacing: 20) {
                if completedReceipt != nil {
                    Button {
                        showReceipt = true
                    } label: {
                        VStack(spacing: 12) {
                            Image(systemName: "doc.text")
                                .font(.system(size: 28))
                            Text("レシートを表示")
                                .font(.body.bold())
                                .tracking(1)
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 100)
                        .background(Color.lunaDark)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.lunaGold.opacity(0.3), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                }

                Button {
                    showCheckout = false
                    selectedTableId = nil
                } label: {
                    VStack(spacing: 12) {
                        Image(systemName: "square.grid.2x2")
                            .font(.system(size: 28))
                        Text("フロアに戻る")
                            .font(.body.bold())
                            .tracking(1)
                    }
                    .foregroundStyle(.lunaDark)
                    .frame(maxWidth: .infinity, minHeight: 100)
                    .background(Color.lunaGoldDark)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 40)
            .padding(.bottom, 50)
        }
        .frame(maxWidth: .infinity)
        .background(Color.lunaBg)
        .sheet(isPresented: $showReceipt) {
            if let receipt = completedReceipt {
                ReceiptPreviewView(receipt: receipt) {
                    showReceipt = false
                }
            }
        }
    }

    // MARK: - Checkout Content

    @ViewBuilder
    private func checkoutContent(table: FloorTable, visit: Visit) -> some View {
        let breakdown = PriceCalculator.calculate(visit: visit, setPlans: vm.setPlans, settings: vm.storeSettings)
        let discount = max(0, Int(discountInput) ?? 0)
        let chargedBeforeRounding = max(0, breakdown.chargedAmount - discount)
        let chargedRounded = vm.storeSettings.applyRounding(to: chargedBeforeRounding)
        let total = chargedRounded + breakdown.expenseTotal

        let regularItems = visit.orderItems.filter { !$0.isExpense }
        let expenseItems = visit.orderItems.filter { $0.isExpense }

        // 左: 注文明細（スクロール）/ 右: 合計・支払い・ボタン（固定）
        HStack(alignment: .top, spacing: 0) {
            // 左カラム: 注文明細
            ScrollView {
                VStack(spacing: 12) {
                    visitInfoSection(visit: visit)
                    orderItemsSection(visit: visit, breakdown: breakdown, regularItems: regularItems, expenseItems: expenseItems)
                }
                .padding()
            }
            .frame(maxWidth: .infinity)

            Divider()

            // 右カラム: 合計・支払い・ボタン
            VStack(spacing: 12) {
                ScrollView {
                    VStack(spacing: 12) {
                        feeBreakdownSection(breakdown: breakdown, discount: discount, total: total)
                        paymentMethodSection
                        if paymentMethod == .cash {
                            cashReceivedSection(total: total)
                        }
                        if showTabWarning {
                            tabWarningBanner
                        }
                    }
                    .padding()
                }
                checkoutButton(table: table, visit: visit, total: total, discount: discount, breakdown: breakdown)
            }
            .frame(width: 360)
        }
        .background(Color.lunaBg)
        .toolbar {
            ToolbarItem(placement: .principal) {
                VStack(spacing: 2) {
                    Text("CHECKOUT — \(table.name)")
                        .font(.headline)
                        .foregroundStyle(.lunaGold)
                        .tracking(2)
                    Text("\(visit.customerName ?? "") · \(visit.guestCount)名")
                        .font(.caption)
                        .foregroundStyle(.lunaSubtle)
                }
            }
            ToolbarItem(placement: .cancellationAction) {
                Button {
                    showCheckout = false
                } label: {
                    Image(systemName: "arrow.left")
                }
            }
        }
        .toolbarBackground(Color.lunaDark, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    // MARK: - Visit Info Section

    private func visitInfoSection(visit: Visit) -> some View {
        GroupBox {
            VStack(alignment: .leading, spacing: 8) {
                Label("ご利用内容", systemImage: "info.circle")
                    .font(.caption.bold())
                    .foregroundStyle(.lunaMuted)
                    .tracking(2)

                infoRow("入店", visit.checkInTime.hhMM)
                infoRow("セット", "\(visit.setMinutes)分 × \(visit.guestCount)名")

                ForEach(visit.nominations.indices, id: \.self) { i in
                    let n = visit.nominations[i]
                    if let c = vm.casts.first(where: { $0.id == n.castId }) {
                        let typeLabel = n.nominationType == .main ? "本指名" : n.nominationType == .inStore ? "場内指名" : ""
                        infoRow("指名\(visit.nominations.count > 1 ? " (\(i+1))" : "")", "\(c.stageName) \(typeLabel)")
                    }
                }

                if let dId = visit.douhanCastId, let dc = vm.casts.first(where: { $0.id == dId }) {
                    infoRow("同伴", dc.stageName)
                }
            }
        }
    }

    // MARK: - Order Items Section

    private func orderItemsSection(visit: Visit, breakdown: PriceCalculator.Breakdown, regularItems: [OrderItem], expenseItems: [OrderItem]) -> some View {
        GroupBox {
            VStack(alignment: .leading, spacing: 8) {
                Label("注文明細", systemImage: "list.bullet")
                    .font(.caption.bold())
                    .foregroundStyle(.lunaMuted)
                    .tracking(2)

                let setPlan = vm.setPlans.first(where: { $0.durationMinutes == visit.setMinutes })
                detailRow("\(setPlan?.name ?? "セット (\(visit.setMinutes)分)") × \(visit.guestCount)名", breakdown.setPrice.yenFormatted)

                ForEach(visit.nominations.indices, id: \.self) { i in
                    let n = visit.nominations[i]
                    if n.nominationType != .none {
                        let fee = n.nominationType == .main ? vm.storeSettings.nominationFeeMain : vm.storeSettings.nominationFeeInStore
                        let c = vm.casts.first(where: { $0.id == n.castId })
                        detailRow("\(c?.stageName ?? "") \(n.nominationType == .main ? "本指名料" : "場内指名料")", fee.yenFormatted)
                    }
                }

                if breakdown.douhanFee > 0 {
                    let dc = vm.casts.first(where: { $0.id == visit.douhanCastId })
                    detailRow("同伴料 (\(dc?.stageName ?? ""))", breakdown.douhanFee.yenFormatted)
                }

                if !regularItems.isEmpty {
                    Divider()
                    ForEach(regularItems) { item in
                        detailRow("\(item.menuItemName) × \(item.quantity)", (item.price * item.quantity).yenFormatted, muted: true)
                    }
                }

                if !expenseItems.isEmpty {
                    Divider().overlay(Color.orange.opacity(0.3))
                    HStack(spacing: 4) {
                        Image(systemName: "receipt").font(.system(size: 10))
                        Text("建て替え（サービス料・消費税なし）").font(.caption)
                    }
                    .foregroundStyle(.orange)

                    ForEach(expenseItems) { item in
                        detailRow("\(item.menuItemName) × \(item.quantity)", (item.price * item.quantity).yenFormatted, color: .orange)
                    }
                }
            }
        }
    }

    // MARK: - Fee Breakdown Section

    private func feeBreakdownSection(breakdown: PriceCalculator.Breakdown, discount: Int, total: Int) -> some View {
        GroupBox {
            VStack(spacing: 8) {
                detailRow("小計", breakdown.subtotal.yenFormatted, muted: true)
                detailRow("サービス料 (40%)", "+\(breakdown.serviceFee.yenFormatted)", muted: true)
                detailRow("消費税 (10%)", "+\(breakdown.tax.yenFormatted)", muted: true)

                if breakdown.expenseTotal > 0 {
                    detailRow("建て替え計", breakdown.expenseTotal.yenFormatted, color: .orange)
                }

                Divider()

                HStack {
                    Text("割引").font(.subheadline).foregroundStyle(.lunaMuted)
                    Spacer()
                    HStack(spacing: 4) {
                        Text("¥").foregroundStyle(.lunaMuted)
                        TextField("0", text: $discountInput)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 100)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                if discount > 0 {
                    detailRow("割引額", "− \(discount.yenFormatted)", color: .red)
                }

                Divider()

                HStack {
                    Text("合計").font(.title3.bold()).foregroundStyle(.lunaGoldDark).tracking(2)
                    Spacer()
                    Text(total.yenFormatted).font(.title2.bold()).foregroundStyle(.lunaGoldDark)
                }
            }
        }
    }

    // MARK: - Payment Method Section

    private var paymentMethodSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("お支払い方法", systemImage: "creditcard")
                .font(.caption.bold())
                .foregroundStyle(.lunaMuted)
                .tracking(2)

            HStack(spacing: 8) {
                ForEach(PaymentMethod.allCases, id: \.self) { method in
                    Button {
                        paymentMethod = method
                        showTabWarning = false
                        receivedInput = ""
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: method.icon).font(.title3)
                            Text(method.label).font(.caption2.bold()).tracking(1)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(paymentMethod == method ? Color.lunaDark : Color.lunaCard)
                        .foregroundStyle(paymentMethod == method ? .lunaGold : .lunaMuted)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(paymentMethod == method ? Color.lunaDark : Color.lunaBorder))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding()
        .background(Color.lunaCard.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Cash Received Section

    private func cashReceivedSection(total: Int) -> some View {
        let received = Int(receivedInput) ?? 0
        let change = received - total

        return GroupBox {
            VStack(spacing: 8) {
                HStack {
                    Text("お預かり").font(.subheadline).foregroundStyle(.lunaMuted)
                    Spacer()
                    HStack(spacing: 4) {
                        Text("¥").foregroundStyle(.lunaMuted)
                        TextField("0", text: $receivedInput)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 120)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                if received > 0 {
                    Divider()
                    HStack {
                        Text("お釣り").font(.subheadline.bold()).foregroundStyle(change >= 0 ? .lunaGold : .red)
                        Spacer()
                        Text(change >= 0 ? change.yenFormatted : "不足 \(abs(change).yenFormatted)")
                            .font(.subheadline.bold())
                            .foregroundStyle(change >= 0 ? .lunaGold : .red)
                    }
                }
            }
        }
    }

    // MARK: - Tab Warning Banner

    private var tabWarningBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.orange)
            Text("ツケ払いには顧客の登録が必要です")
                .font(.subheadline)
                .foregroundStyle(.orange)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.orange.opacity(0.15))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Checkout Button

    private func checkoutButton(table: FloorTable, visit: Visit, total: Int, discount: Int, breakdown: PriceCalculator.Breakdown) -> some View {
        let received = Int(receivedInput) ?? 0
        let change = received > 0 ? received - total : 0
        // 現金で預かり入力済みだが不足の場合は無効
        let cashInsufficient = paymentMethod == .cash && received > 0 && received < total

        return VStack(spacing: 0) {
            // 現金で預かり入力済みの場合、お釣りをボタン上に表示
            if paymentMethod == .cash && received >= total && received > 0 {
                HStack {
                    Text("お預かり \(received.yenFormatted)")
                        .font(.caption)
                        .foregroundStyle(.lunaMuted)
                    Spacer()
                    Text("お釣り \(change.yenFormatted)")
                        .font(.caption.bold())
                        .foregroundStyle(.lunaGold)
                }
                .padding(.horizontal)
                .padding(.top, 8)
                .padding(.bottom, 4)
            }

            Button {
                // ツケで顧客未登録の場合は警告
                if paymentMethod == .tab && visit.customerId == nil {
                    showTabWarning = true
                    return
                }
                completedChange = paymentMethod == .cash && received >= total ? change : 0
                handleCheckout(table: table, visit: visit, total: total, discount: discount, breakdown: breakdown)
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: paymentMethod == .cash ? "yensign" : "creditcard")
                    Text("\(total.yenFormatted) で会計する")
                        .tracking(2)
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            }
            .buttonStyle(.borderedProminent)
            .tint(cashInsufficient ? .gray : .lunaDark)
            .disabled(cashInsufficient)
            .padding(.horizontal)
            .padding(.bottom)
        }
        .background(.lunaCard)
    }

    // MARK: - Helpers

    @ViewBuilder
    private func infoRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label).font(.subheadline).foregroundStyle(.lunaMuted)
            Spacer()
            Text(value).font(.subheadline)
        }
    }

    @ViewBuilder
    private func detailRow(_ label: String, _ value: String, muted: Bool = false, color: Color? = nil) -> some View {
        HStack {
            Text(label).font(.subheadline).foregroundStyle(color ?? (muted ? .lunaMuted : .primary))
            Spacer()
            Text(value).font(.subheadline).foregroundStyle(color ?? .primary)
        }
    }

    private func handleCheckout(table: FloorTable, visit: Visit, total: Int, discount: Int, breakdown: PriceCalculator.Breakdown) {
        completedTotal = total
        completed = true

        let payment = Payment(
            id: UUID().uuidString,
            visitId: visit.id,
            tableId: table.id,
            customerName: visit.customerName,
            subtotal: breakdown.subtotal,
            expenseTotal: breakdown.expenseTotal,
            nominationFee: breakdown.nominationFees,
            serviceFee: breakdown.serviceFee,
            tax: breakdown.tax,
            discount: discount,
            total: total,
            paymentMethod: paymentMethod,
            paidAt: Date(),
            items: visit.orderItems
        )
        vm.checkout(payment: payment)

        // レシートデータ生成（インボイス対応）
        completedReceipt = ReceiptData.from(
            payment: payment,
            visit: visit,
            breakdown: breakdown,
            settings: vm.storeSettings,
            casts: vm.casts
        )
    }
}
