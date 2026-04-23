import Foundation

enum RoundingType: String {
    case none, floor, ceil, round
}

@Observable
final class StoreSettings: @unchecked Sendable {
    var serviceRate: Double = 0.4
    var taxRate: Double = 0.1
    var douhanFee: Int = 3000
    var nominationFeeMain: Int = 5000
    var nominationFeeInStore: Int = 2000
    var extensionFeePerPerson: Int = 5000
    var invoiceRegistrationNumber: String?
    var minRequiredVersion: String?
    var roundingUnit: Int = 1
    var roundingType: RoundingType = .none

    init() {}

    init(from row: StoreRow) {
        serviceRate = row.serviceRate
        taxRate = row.taxRate
        douhanFee = row.douhanFee
        nominationFeeMain = row.nominationFeeMain
        nominationFeeInStore = row.nominationFeeInStore
        extensionFeePerPerson = row.extensionFeePerPerson ?? 5000
        invoiceRegistrationNumber = row.invoiceRegistrationNumber
        minRequiredVersion = row.minRequiredVersion
        roundingUnit = row.roundingUnit ?? 1
        roundingType = RoundingType(rawValue: row.roundingType ?? "none") ?? .none
    }

    /// 合計金額に端数処理を適用する
    func applyRounding(to amount: Int) -> Int {
        guard roundingUnit > 1, roundingType != .none else { return amount }
        let unit = Double(roundingUnit)
        switch roundingType {
        case .floor: return Int(Foundation.floor(Double(amount) / unit) * unit)
        case .ceil:  return Int(Foundation.ceil(Double(amount) / unit) * unit)
        case .round: return Int((Double(amount) / unit).rounded() * unit)
        case .none:  return amount
        }
    }
}
