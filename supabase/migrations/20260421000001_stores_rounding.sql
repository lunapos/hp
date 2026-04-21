-- stores: 端数処理設定カラム追加
-- rounding_unit: 端数処理の単位（1=なし, 10=10円, 100=100円）
-- rounding_type: 端数処理の種別（none=なし, floor=切り捨て, ceil=切り上げ, round=四捨五入）
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS rounding_unit INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rounding_type TEXT NOT NULL DEFAULT 'none'
    CHECK (rounding_type IN ('none', 'floor', 'ceil', 'round'));
