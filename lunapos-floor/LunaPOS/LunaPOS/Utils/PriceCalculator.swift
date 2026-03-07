import Foundation
import OSLog

private let logger = Logger(subsystem: "com.luna.pos", category: "PriceCalculator")

/// 割引情報（1.3.5）
struct DiscountInfo: Codable, Sendable {
    var amountDiscount: Int = 0            // 金額割引
    var percentDiscount: Double = 0         // パーセント割引（0.0〜1.0）
    var reason: String?                     // 割引理由

    /// 合計割引額を計算（金額割引 → パーセント割引の順に適用）
    func totalDiscount(for subtotal: Int) -> Int {
        let afterAmountDiscount = max(0, subtotal - amountDiscount)
        let percentAmount = Int(floor(Double(afterAmountDiscount) * percentDiscount))
        return amountDiscount + percentAmount
    }
}

enum PriceCalculator {

    struct Breakdown: Sendable {
        let setPrice: Int
        let extensionPrice: Int
        let nominationFees: Int
        let douhanFee: Int
        let regularOrderTotal: Int
        let expenseTotal: Int
        let discount: Int
        let subtotal: Int          // 割引前小計
        let discountedSubtotal: Int // 割引後小計
        let serviceFee: Int
        let tax: Int
        let chargedAmount: Int
        let isManualOverride: Bool
    }

    // MARK: - 指名料計算（1.3.2）

    static func nominationFee(for nomination: CastNomination, overrides: [String: Int], settings: StoreSettings? = nil) -> Int {
        if let override = overrides[nomination.castId] {
            return override
        }
        let s = settings
        switch nomination.nominationType {
        case .main: return s?.nominationFeeMain ?? Fees.nominationFeeMain
        case .inStore: return s?.nominationFeeInStore ?? Fees.nominationFeeInStore
        case .none: return 0
        }
    }

    // MARK: - 延長料金計算（1.3.4）

    static func extensionPrice(visit: Visit, setPlans: [SetPlan], settings: StoreSettings? = nil) -> Int {
        guard visit.extensionMinutes > 0 else { return 0 }

        let extensionRounds = visit.extensionMinutes / 30
        guard extensionRounds > 0 else { return 0 }

        // 延長料金が設定されている場合はそれを使用
        let extensionFee = settings?.extensionFeePerPerson ?? 5000

        // 延長料金は注文アイテム（ext_xxx）として既に計上されているため、
        // ここでは別途計算しない（重複防止）
        return 0
    }

    // MARK: - メイン計算

    static func calculate(
        visit: Visit,
        setPlans: [SetPlan],
        settings: StoreSettings? = nil,
        discountInfo: DiscountInfo? = nil,
        manualOverrideTotal: Int? = nil
    ) -> Breakdown {
        // 手動上書き対応（1.3.7）
        if let manualTotal = manualOverrideTotal {
            return calculateManualOverride(
                visit: visit, setPlans: setPlans, settings: settings,
                manualTotal: manualTotal
            )
        }

        // セット料金（1.3.1: StoreSettingsから取得）
        let setPlanUnitPrice = setPlans.first(where: { $0.durationMinutes == visit.setMinutes })?.price ?? 0
        let setPrice = visit.setPriceOverride ?? (setPlanUnitPrice * visit.setGuestCount)

        // フォールバック時に警告（1.3.1）
        if settings == nil {
            logger.warning("StoreSettings未取得 — デフォルト値を使用（税率10%, サービス料40%）")
        }

        // 指名料（1.3.2）
        let nominationFees = visit.nominations.reduce(0) { sum, n in
            guard n.nominationType != .none else { return sum }
            let unitFee = nominationFee(for: n, overrides: visit.nominationFeeOverrides, settings: settings)
            return sum + unitFee * n.qty
        }

        // 同伴料（1.3.3）
        let defaultDouhanFee = settings?.douhanFee ?? Fees.douhanFee
        let douhanUnitFee = visit.douhanFeeOverride ?? (visit.douhanCastId != nil ? defaultDouhanFee : 0)
        let douhanFee = douhanUnitFee * visit.douhanQty

        // 通常オーダー合計（建て替え除外）
        let regularOrderTotal = visit.orderItems
            .filter { !$0.isExpense && $0.quantity > 0 }
            .reduce(0) { $0 + $1.price * $1.quantity }

        // 建て替え合計（1.3.6: サービス料・税の対象外）
        let expenseTotal = visit.orderItems
            .filter { $0.isExpense && $0.quantity > 0 }
            .reduce(0) { $0 + $1.price * $1.quantity }

        // 割引前小計
        let subtotal = setPrice + nominationFees + douhanFee + regularOrderTotal

        // 割引計算（1.3.5）
        let discount: Int
        if let info = discountInfo {
            discount = min(info.totalDiscount(for: subtotal), subtotal)
        } else {
            discount = 0
        }

        // 割引後小計（1.3.5: 0円未満にならないガード）
        let discountedSubtotal = max(0, subtotal - discount)

        // サービス料（1.3.6）
        let serviceRate = settings?.serviceRate ?? Fees.serviceRate
        let serviceFee = Int(floor(Double(discountedSubtotal) * serviceRate))

        // 消費税（1.3.6）: (割引後小計 + サービス料) × 税率
        let taxRate = settings?.taxRate ?? Fees.taxRate
        let taxBase = discountedSubtotal + serviceFee
        let tax = Int(floor(Double(taxBase) * taxRate))

        // オーバーフローチェック（1.3.6）
        let chargedAmount: Int
        let sum = discountedSubtotal + serviceFee + tax
        if sum < 0 || sum > Int.max / 2 {
            logger.error("金額オーバーフロー検出: subtotal=\(subtotal)")
            chargedAmount = max(0, sum)
        } else {
            chargedAmount = sum
        }

        return Breakdown(
            setPrice: setPrice,
            extensionPrice: 0, // 延長料金はorderItemsに含まれる
            nominationFees: nominationFees,
            douhanFee: douhanFee,
            regularOrderTotal: regularOrderTotal,
            expenseTotal: expenseTotal,
            discount: discount,
            subtotal: subtotal,
            discountedSubtotal: discountedSubtotal,
            serviceFee: serviceFee,
            tax: tax,
            chargedAmount: chargedAmount,
            isManualOverride: false
        )
    }

    // MARK: - 手動上書き時の逆算（1.3.7）

    private static func calculateManualOverride(
        visit: Visit,
        setPlans: [SetPlan],
        settings: StoreSettings?,
        manualTotal: Int
    ) -> Breakdown {
        let serviceRate = settings?.serviceRate ?? Fees.serviceRate
        let taxRate = settings?.taxRate ?? Fees.taxRate

        // 建て替え合計
        let expenseTotal = visit.orderItems
            .filter { $0.isExpense && $0.quantity > 0 }
            .reduce(0) { $0 + $1.price * $1.quantity }

        // 手動合計から建て替えを除いた課税対象
        let taxableTotal = max(0, manualTotal - expenseTotal)

        // 逆算: chargedAmount = subtotal × (1 + serviceRate) × (1 + taxRate)
        // → subtotal = chargedAmount / ((1 + serviceRate) × (1 + taxRate))
        // ただし正確には: chargedAmount = subtotal + floor(subtotal * serviceRate) + floor((subtotal + floor(subtotal * serviceRate)) * taxRate)
        // 近似逆算
        let multiplier = (1 + serviceRate) * (1 + taxRate)
        let estimatedSubtotal = Int(floor(Double(taxableTotal) / multiplier))
        let serviceFee = Int(floor(Double(estimatedSubtotal) * serviceRate))
        let tax = Int(floor(Double(estimatedSubtotal + serviceFee) * taxRate))

        // セット料金
        let setPlanUnitPrice = setPlans.first(where: { $0.durationMinutes == visit.setMinutes })?.price ?? 0
        let setPrice = visit.setPriceOverride ?? (setPlanUnitPrice * visit.setGuestCount)

        // 指名料
        let nominationFees = visit.nominations.reduce(0) { sum, n in
            guard n.nominationType != .none else { return sum }
            let unitFee = nominationFee(for: n, overrides: visit.nominationFeeOverrides, settings: settings)
            return sum + unitFee * n.qty
        }

        // 同伴料
        let defaultDouhanFee = settings?.douhanFee ?? Fees.douhanFee
        let douhanUnitFee = visit.douhanFeeOverride ?? (visit.douhanCastId != nil ? defaultDouhanFee : 0)
        let douhanFee = douhanUnitFee * visit.douhanQty

        let regularOrderTotal = visit.orderItems
            .filter { !$0.isExpense && $0.quantity > 0 }
            .reduce(0) { $0 + $1.price * $1.quantity }

        return Breakdown(
            setPrice: setPrice,
            extensionPrice: 0,
            nominationFees: nominationFees,
            douhanFee: douhanFee,
            regularOrderTotal: regularOrderTotal,
            expenseTotal: expenseTotal,
            discount: 0,
            subtotal: estimatedSubtotal,
            discountedSubtotal: estimatedSubtotal,
            serviceFee: serviceFee,
            tax: tax,
            chargedAmount: taxableTotal,
            isManualOverride: true
        )
    }

    // MARK: - 合計計算

    static func total(visit: Visit, setPlans: [SetPlan], discount: Int = 0, settings: StoreSettings? = nil) -> Int {
        let discountInfo = discount > 0 ? DiscountInfo(amountDiscount: discount) : nil
        let b = calculate(visit: visit, setPlans: setPlans, settings: settings, discountInfo: discountInfo)
        return max(0, b.chargedAmount) + b.expenseTotal
    }
}
