import Foundation

enum PriceCalculator {

    struct Breakdown {
        let setPrice: Int
        let nominationFees: Int
        let douhanFee: Int
        let regularOrderTotal: Int
        let expenseTotal: Int
        let subtotal: Int
        let serviceFee: Int
        let tax: Int
        let chargedAmount: Int
    }

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

    static func calculate(visit: Visit, setPlans: [SetPlan], settings: StoreSettings? = nil) -> Breakdown {
        let setPlanUnitPrice = setPlans.first(where: { $0.durationMinutes == visit.setMinutes })?.price ?? 0
        let setPrice = visit.setPriceOverride ?? (setPlanUnitPrice * visit.setGuestCount)

        let nominationFees = visit.nominations.reduce(0) { sum, n in
            guard n.nominationType != .none else { return sum }
            let unitFee = nominationFee(for: n, overrides: visit.nominationFeeOverrides, settings: settings)
            return sum + unitFee * n.qty
        }

        let defaultDouhanFee = settings?.douhanFee ?? Fees.douhanFee
        let douhanUnitFee = visit.douhanFeeOverride ?? (visit.douhanCastId != nil ? defaultDouhanFee : 0)
        let douhanFee = douhanUnitFee * visit.douhanQty

        let regularOrderTotal = visit.orderItems
            .filter { !$0.isExpense }
            .reduce(0) { $0 + $1.price * $1.quantity }

        let expenseTotal = visit.orderItems
            .filter { $0.isExpense }
            .reduce(0) { $0 + $1.price * $1.quantity }

        let subtotal = setPrice + nominationFees + douhanFee + regularOrderTotal
        let serviceFee = Int(floor(Double(subtotal) * (settings?.serviceRate ?? Fees.serviceRate)))
        let tax = Int(floor(Double(subtotal) * (settings?.taxRate ?? Fees.taxRate)))
        let chargedAmount = subtotal + serviceFee + tax

        return Breakdown(
            setPrice: setPrice,
            nominationFees: nominationFees,
            douhanFee: douhanFee,
            regularOrderTotal: regularOrderTotal,
            expenseTotal: expenseTotal,
            subtotal: subtotal,
            serviceFee: serviceFee,
            tax: tax,
            chargedAmount: chargedAmount
        )
    }

    static func total(visit: Visit, setPlans: [SetPlan], discount: Int = 0, settings: StoreSettings? = nil) -> Int {
        let b = calculate(visit: visit, setPlans: setPlans, settings: settings)
        return max(0, b.chargedAmount - discount) + b.expenseTotal
    }
}
