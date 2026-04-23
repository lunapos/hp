import XCTest
@testable import LunaPOS

/// 1.2.6 SyncEngine ユニットテスト
final class SyncEngineTests: XCTestCase {

    // MARK: - SyncMetadata テスト

    func test_SyncMetadata_デフォルト値() {
        let meta = SyncMetadata()
        XCTAssertTrue(meta.needsSync)
        XCTAssertNil(meta.lastSyncedAt)
        XCTAssertEqual(meta.syncRetryCount, 0)
        XCTAssertFalse(meta.isSyncFailed)
    }

    func test_SyncMetadata_3回でsyncFailed() {
        var meta = SyncMetadata()
        meta.syncRetryCount = 2
        XCTAssertFalse(meta.isSyncFailed)

        meta.syncRetryCount = 3
        XCTAssertTrue(meta.isSyncFailed)
    }

    func test_SyncMetadata_Codable() {
        let original = SyncMetadata(needsSync: false, lastSyncedAt: Date(), syncRetryCount: 2)
        let data = try! JSONEncoder().encode(original)
        let decoded = try! JSONDecoder().decode(SyncMetadata.self, from: data)

        XCTAssertEqual(decoded.needsSync, original.needsSync)
        XCTAssertEqual(decoded.syncRetryCount, original.syncRetryCount)
    }

    // MARK: - SyncEngine メタデータ管理

    func test_markNeedsSync_フラグが立つ() {
        let engine = SyncEngine()
        let entityId = UUID().uuidString
        engine.markNeedsSync(entityId)
        let meta = engine.getMetadata(for: entityId)
        XCTAssertTrue(meta.needsSync)
    }

    func test_resetRetryCount_リセットされる() {
        let engine = SyncEngine()
        let entityId = UUID().uuidString

        // 3回失敗させる
        engine.updateMetadata(for: entityId) {
            $0.syncRetryCount = 3
            $0.needsSync = false
        }
        XCTAssertTrue(engine.getMetadata(for: entityId).isSyncFailed)

        // リセット
        engine.resetRetryCount(entityId)
        let meta = engine.getMetadata(for: entityId)
        XCTAssertEqual(meta.syncRetryCount, 0)
        XCTAssertTrue(meta.needsSync)
        XCTAssertFalse(meta.isSyncFailed)
    }

    // MARK: - SyncEntityType 順序テスト

    func test_同期順序_外部キー依存順() {
        let types = SyncEntityType.allCases.sorted()
        XCTAssertEqual(types[0], .visit)
        XCTAssertEqual(types[1], .nomination)
        XCTAssertEqual(types[2], .orderItem)
        XCTAssertEqual(types[3], .payment)
        XCTAssertEqual(types[4], .cashWithdrawal)
    }

    // MARK: - 空データテスト

    func test_needsSyncが0件の場合何も起きない() {
        let engine = SyncEngine()
        // needsSync=true のレコードがない状態
        // syncPendingRecords は private なので、間接的に検証
        // retryFailed を呼んでもクラッシュしないことを確認
        engine.retryFailed()
        XCTAssertEqual(engine.syncFailedCount, 0)
    }

    // MARK: - ネットワーク状態テスト

    func test_NetworkMonitor_初期化() {
        let monitor = NetworkMonitor.shared
        // isConnectedはBool値が返ること（値自体は環境依存）
        _ = monitor.isConnected
        _ = monitor.connectionType
        // クラッシュしないことを確認
    }

    // MARK: - ErrorState テスト

    func test_ErrorState_初期値() {
        let state = ErrorState()
        XCTAssertNil(state.lastError)
        XCTAssertFalse(state.showDBWriteError)
        XCTAssertEqual(state.consecutiveErrorCount, 0)
    }

    func test_ErrorState_3回連続でサポート案内() {
        let state = ErrorState()
        state.consecutiveErrorCount = 2
        XCTAssertEqual(state.dbWriteErrorMessage, "データの保存に失敗しました。もう一度お試しください。")

        state.consecutiveErrorCount = 3
        XCTAssertEqual(state.dbWriteErrorMessage, "サポートにお問い合わせください")
    }

    func test_ErrorState_リセット() {
        let state = ErrorState()
        state.lastError = "テストエラー"
        state.showDBWriteError = true
        state.consecutiveErrorCount = 5

        state.resetErrors()
        XCTAssertNil(state.lastError)
        XCTAssertFalse(state.showDBWriteError)
        XCTAssertEqual(state.consecutiveErrorCount, 0)
    }

    // MARK: - DiscountInfo テスト

    func test_DiscountInfo_金額割引() {
        let info = DiscountInfo(amountDiscount: 1000)
        XCTAssertEqual(info.totalDiscount(for: 5000), 1000)
    }

    func test_DiscountInfo_パーセント割引() {
        let info = DiscountInfo(percentDiscount: 0.1)
        XCTAssertEqual(info.totalDiscount(for: 5000), 500)
    }

    func test_DiscountInfo_複合割引_金額先() {
        let info = DiscountInfo(amountDiscount: 1000, percentDiscount: 0.1)
        // 5000 - 1000 = 4000 → floor(4000 × 0.1) = 400
        // 合計: 1000 + 400 = 1400
        XCTAssertEqual(info.totalDiscount(for: 5000), 1400)
    }

    func test_DiscountInfo_金額が小計を超える場合() {
        let info = DiscountInfo(amountDiscount: 10000)
        // max(0, 5000 - 10000) = 0 → パーセント割引もかからない
        // 合計: 10000 + 0 = 10000（呼び出し元でmin制約）
        XCTAssertEqual(info.totalDiscount(for: 5000), 10000)
    }
}
