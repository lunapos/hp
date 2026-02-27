import SwiftUI

struct CheckoutView: View {
    let tableId: String
    @Environment(AppViewModel.self) private var vm
    @Binding var selectedTableId: String?
    @Binding var showCheckout: Bool

    @State private var paymentMethod: PaymentMethod = .cash
    @State private var discountInput = ""
    @State private var completed = false
    @State private var completedTotal = 0

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
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "checkmark")
                .font(.system(size: 36))
                .foregroundStyle(.lunaGold)
                .frame(width: 80, height: 80)
                .background(Color.lunaDark)
                .clipShape(Circle())

            Text("THANK YOU")
                .font(.title.bold())
                .tracking(4)

            Text(completedTotal.yenFormatted)
                .font(.title2.bold())
                .foregroundStyle(.lunaGoldDark)

            Text("フロアに戻ります...")
                .font(.caption)
                .foregroundStyle(.lunaMuted)
                .tracking(2)
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .background(Color.lunaBg)
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                showCheckout = false
                selectedTableId = nil
            }
        }
    }

    // MARK: - Checkout Content

    @ViewBuilder
    private func checkoutContent(table: FloorTable, visit: Visit) -> some View {
        let breakdown = PriceCalculator.calculate(visit: visit, setPlans: vm.setPlans, settings: vm.storeSettings)
        let discount = max(0, Int(discountInput) ?? 0)
        let total = max(0, breakdown.chargedAmount - discount) + breakdown.expenseTotal

        let regularItems = visit.orderItems.filter { !$0.isExpense }
        let expenseItems = visit.orderItems.filter { $0.isExpense }

        ScrollView {
            VStack(spacing: 12) {
                // Visit info
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

                // Order items
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

                // Fee breakdown
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

                // Payment method
                GroupBox {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("お支払い方法", systemImage: "creditcard")
                            .font(.caption.bold())
                            .foregroundStyle(.lunaMuted)
                            .tracking(2)

                        HStack(spacing: 8) {
                            ForEach(PaymentMethod.allCases, id: \.self) { method in
                                Button {
                                    paymentMethod = method
                                } label: {
                                    VStack(spacing: 6) {
                                        Image(systemName: method.icon).font(.title3)
                                        Text(method.label).font(.caption.bold()).tracking(1)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(paymentMethod == method ? Color.lunaDark : Color.lunaCard)
                                    .foregroundStyle(paymentMethod == method ? .lunaGold : .lunaMuted)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(paymentMethod == method ? Color.lunaDark : Color.lunaBorder))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color.lunaBg)
        .safeAreaInset(edge: .bottom) {
            Button {
                handleCheckout(table: table, visit: visit, total: total, discount: discount, breakdown: breakdown)
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "creditcard")
                    Text("\(total.yenFormatted) で会計する")
                        .tracking(2)
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            }
            .buttonStyle(.borderedProminent)
            .tint(.lunaDark)
            .padding()
            .background(.lunaCard)
        }
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
    }
}
