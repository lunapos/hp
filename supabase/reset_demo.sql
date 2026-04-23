-- ============================================================
-- LunaPOS デモデータリセット
-- テナントID: c0000000-0000-0000-0000-000000000001
--
-- 来店・会計・シフトデータをクリアしてフレッシュな状態に戻す。
-- マスタデータ（キャスト・メニュー・テーブル等）は残す。
--
-- 実行後は seed_demo.sql を再実行すること。
-- ============================================================

-- 来店・会計系データをクリア（依存順に削除）
DELETE FROM payment_items  WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';
DELETE FROM payments       WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';
DELETE FROM order_items    WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';
DELETE FROM nominations    WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';
DELETE FROM visits         WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';

-- テーブルを全て空席に戻す
UPDATE floor_tables
SET status = 'empty', visit_id = NULL
WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';

-- シフトデータをクリア（seed_demo.sql で再投入される）
DELETE FROM cast_shifts    WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';

-- その他
DELETE FROM cash_withdrawals  WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';
DELETE FROM register_sessions WHERE tenant_id = 'c0000000-0000-0000-0000-000000000001';

DO $$
BEGIN
    RAISE NOTICE 'デモデータのリセットが完了しました。seed_demo.sql で再投入してください。';
END
$$;
