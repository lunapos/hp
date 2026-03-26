import SwiftUI

/// レシートプレビュー（80mm幅レシートを画面上で再現）
/// インボイス対応: 登録番号・税率区分・税額を表示
struct ReceiptPreviewView: View {
    let receipt: ReceiptData
    let onDismiss: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // ヘッダーバー
            HStack {
                Text("レシートプレビュー")
                    .font(.headline)
                    .foregroundStyle(.lunaGold)
                    .tracking(2)
                Spacer()
                Button {
                    onDismiss()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundStyle(.lunaMuted)
                }
            }
            .padding()
            .background(Color.lunaDark)

            // レシート本体
            ScrollView {
                VStack(spacing: 0) {
                    receiptContent
                        .padding(.horizontal, 24)
                        .padding(.vertical, 20)
                }
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 4))
                .padding()
            }
            .background(Color.lunaBg)

            // 印刷ボタン（将来用）
            HStack(spacing: 16) {
                Button {
                    onDismiss()
                } label: {
                    HStack {
                        Image(systemName: "checkmark")
                        Text("閉じる")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(.lunaDark)
            }
            .padding()
            .background(Color.lunaCard)
        }
    }

    // MARK: - レシート本体

    private var receiptContent: some View {
        VStack(spacing: 6) {
            // 店名
            Text(receipt.storeName)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(.black)

            if let address = receipt.storeAddress {
                Text(address)
                    .font(.system(size: 10))
                    .foregroundStyle(.gray)
            }
            if let phone = receipt.storePhone {
                Text("TEL: \(phone)")
                    .font(.system(size: 10))
                    .foregroundStyle(.gray)
            }

            // インボイス登録番号
            if let regNumber = receipt.invoiceRegistrationNumber, !regNumber.isEmpty {
                Text("登録番号: \(regNumber)")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(.black)
            }

            dashedLine

            // 日時
            Text(receipt.receiptDate.formatted(
                .dateTime.year().month().day().hour().minute()
            ))
            .font(.system(size: 11))
            .foregroundStyle(.black)

            if !receipt.tableName.isEmpty {
                Text("テーブル: \(receipt.tableName)")
                    .font(.system(size: 11))
                    .foregroundStyle(.black)
            }

            Text("人数: \(receipt.guestCount)名")
                .font(.system(size: 11))
                .foregroundStyle(.black)

            dashedLine

            // 明細ヘッダー
            receiptRow("品名", "金額", bold: true)

            Divider().frame(height: 0.5).background(Color.black)

            // セット料金
            receiptItemRow(receipt.setPrice)

            // 延長
            ForEach(Array(receipt.extensionItems.enumerated()), id: \.offset) { _, item in
                receiptItemRow(item)
            }

            // 指名
            ForEach(Array(receipt.nominationItems.enumerated()), id: \.offset) { _, item in
                receiptItemRow(item)
            }

            // 同伴
            ForEach(Array(receipt.douhanItems.enumerated()), id: \.offset) { _, item in
                receiptItemRow(item)
            }

            // オーダー
            ForEach(Array(receipt.orderItems.enumerated()), id: \.offset) { _, item in
                receiptItemRow(item)
            }

            // 建て替え
            if !receipt.expenseItems.isEmpty {
                Divider().frame(height: 0.5).background(Color.black)
                ForEach(Array(receipt.expenseItems.enumerated()), id: \.offset) { _, item in
                    receiptItemRow(item)
                }
            }

            dashedLine

            // 金額サマリー
            receiptRow("小計", receipt.subtotal.yenFormatted)
            receiptRow("サービス料", receipt.serviceCharge.yenFormatted)

            // 税率区分表示（インボイス要件）
            let taxPercent = Int(receipt.taxRate * 100)
            receiptRow("消費税（\(taxPercent)%）", receipt.taxAmount.yenFormatted)

            if receipt.discountAmount > 0 {
                receiptRow("割引", "−\(receipt.discountAmount.yenFormatted)")
            }

            if receipt.expenseItems.reduce(0, { $0 + $1.subtotal }) > 0 {
                let expenseTotal = receipt.expenseItems.reduce(0) { $0 + $1.subtotal }
                receiptRow("建て替え計", expenseTotal.yenFormatted)
            }

            Divider().frame(height: 1).background(Color.black)

            // 合計
            receiptRow("合計", receipt.totalAmount.yenFormatted, bold: true, large: true)

            dashedLine

            // 税率区分合計（インボイス要件: 税率ごとに区分した合計金額）
            if receipt.invoiceRegistrationNumber != nil {
                VStack(spacing: 2) {
                    let taxPercent = Int(receipt.taxRate * 100)
                    receiptRow("\(taxPercent)%対象", receipt.taxableAmount.yenFormatted)
                    receiptRow("（内消費税）", receipt.taxAmount.yenFormatted)
                }
                dashedLine
            }

            // 支払い方法
            receiptRow("お支払い", receipt.paymentMethod)

            Spacer().frame(height: 12)

            // フッター
            Text(receipt.footerMessage)
                .font(.system(size: 11))
                .foregroundStyle(.gray)
                .multilineTextAlignment(.center)

            Spacer().frame(height: 8)

            Text("Luna Pos")
                .font(.system(size: 9))
                .foregroundStyle(.gray.opacity(0.6))
        }
    }

    // MARK: - Helpers

    private var dashedLine: some View {
        Text(String(repeating: "─", count: 30))
            .font(.system(size: 8))
            .foregroundStyle(.gray)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 4)
    }

    private func receiptRow(_ label: String, _ value: String, bold: Bool = false, large: Bool = false) -> some View {
        HStack {
            Text(label)
                .font(.system(size: large ? 14 : 11, weight: bold ? .bold : .regular))
                .foregroundStyle(.black)
            Spacer()
            Text(value)
                .font(.system(size: large ? 14 : 11, weight: bold ? .bold : .regular))
                .foregroundStyle(.black)
        }
    }

    private func receiptItemRow(_ item: ReceiptData.ReceiptLineItem) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 1) {
                Text(item.name)
                    .font(.system(size: 11))
                    .foregroundStyle(.black)
                if item.quantity > 1 {
                    Text("  \(item.unitPrice.yenFormatted) × \(item.quantity)")
                        .font(.system(size: 9))
                        .foregroundStyle(.gray)
                }
            }
            Spacer()
            Text(item.subtotal.yenFormatted)
                .font(.system(size: 11))
                .foregroundStyle(.black)
        }
    }
}
