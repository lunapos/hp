import Foundation

@Observable
final class StoreSettings: @unchecked Sendable {
    var serviceRate: Double = 0.4
    var taxRate: Double = 0.1
    var douhanFee: Int = 3000
    var nominationFeeMain: Int = 5000
    var nominationFeeInStore: Int = 2000
    var extensionFeePerPerson: Int = 5000
    var invoiceRegistrationNumber: String?

    init() {}

    init(from row: StoreRow) {
        serviceRate = row.serviceRate
        taxRate = row.taxRate
        douhanFee = row.douhanFee
        nominationFeeMain = row.nominationFeeMain
        nominationFeeInStore = row.nominationFeeInStore
        extensionFeePerPerson = row.extensionFeePerPerson ?? 5000
        invoiceRegistrationNumber = row.invoiceRegistrationNumber
    }
}
