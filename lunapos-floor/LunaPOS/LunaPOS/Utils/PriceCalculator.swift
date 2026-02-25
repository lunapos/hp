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

    static func nominationFee(for nomination: CastNomination, overrides: [String: Int]) -> Int {
        if let override = overrides[nomination.castId] {
            return override
        }
        switch nomination.nominationType {
        case .main: return Fees.nominationFeeMain
        case .inStore: return Fees.nominationFeeInStore
        case .none: return 0
        }
    }

    static func calculate(visit: Visit, setPlans: [SetPlan]) -> Breakdown {
        let setPlanUnitPrice = setPlans.first(where: { $0.durationMinutes == visit.setMinutes })?.price ?? 0
        let setPrice = visit.setPriceOverride ?? (setPlanUnitPrice * visit.guestCount)

        let nominationFees = visit.nominations.reduce(0) { sum, n in
            guard n.nominationType != .none else { return sum }
            let unitFee = nominationFee(for: n, overrides: visit.nominationFeeOverrides)
            return sum + unitFee * n.qty
        }

        let douhanUnitFee = visit.douhanFeeOverride ?? (visit.douhanCastId != nil ? Fees.douhanFee : 0)
        let douhanFee = douhanUnitFee * visit.douhanQty

        let regularOrderTotal = visit.orderItems
            .filter { !$0.isExpense }
            .reduce(0) { $0 + $1.price * $1.quantity }

        let expenseTotal = visit.orderItems
            .filter { $0.isExpense }
            .reduce(0) { $0 + $1.price * $1.quantity }

        let subtotal = setPrice + nominationFees + douhanFee + regularOrderTotal
        let serviceFee = Int(floor(Double(subtotal) * Fees.serviceRate))
        let tax = Int(floor(Double(subtotal) * Fees.taxRate))
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

    static func total(visit: Visit, setPlans: [SetPlan], discount: Int = 0) -> Int {
        let b = calculate(visit: visit, setPlans: setPlans)
        return max(0, b.chargedAmount - discount) + b.expenseTotal
    }
}
