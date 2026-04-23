import Foundation

// デフォルト値（Supabase未接続時のフォールバック）
// 接続後は StoreSettings（stores テーブル）の値が使われる
enum Fees {
    static let serviceRate = 0.4
    static let taxRate = 0.1
    static let douhanFee = 3000
    static let nominationFeeMain = 5000
    static let nominationFeeInStore = 2000
}
