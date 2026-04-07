-- ============================================================
-- cast_shifts: 二重出勤防止
-- 同一テナント・同一キャストで clock_out IS NULL のレコードは1件のみ許可
-- ============================================================

-- 既存の重複レコードをクリーンアップ（最古の1件を残し、残りをクローズ）
UPDATE cast_shifts
SET clock_out = clock_in + INTERVAL '1 second'
WHERE id NOT IN (
    -- 各キャスト×テナントの最古の「勤務中」レコードを残す
    SELECT DISTINCT ON (tenant_id, cast_id) id
    FROM cast_shifts
    WHERE clock_out IS NULL
    ORDER BY tenant_id, cast_id, clock_in ASC
)
AND clock_out IS NULL;

-- 部分ユニーク制約: clock_out IS NULL のレコードはキャスト+テナントで1件のみ
CREATE UNIQUE INDEX idx_cast_shifts_active_shift
    ON cast_shifts (tenant_id, cast_id)
    WHERE clock_out IS NULL;
