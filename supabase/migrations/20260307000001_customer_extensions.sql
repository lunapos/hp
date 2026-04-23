-- ============================================================
-- Phase 3.1: 顧客データモデル拡張
-- ============================================================

-- ランク定義拡張: bronze / silver / gold / platinum
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_rank_check;
ALTER TABLE customers ADD CONSTRAINT customers_rank_check
  CHECK (rank IN ('new', 'repeat', 'vip', 'bronze', 'silver', 'gold', 'platinum'));

-- 新カラム追加
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_visit_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS anniversary DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS favorite_drink TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ng_notes TEXT;

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(tenant_id, name);

-- ランク自動更新関数
CREATE OR REPLACE FUNCTION update_customer_rank()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visit_count >= 20 THEN
    NEW.rank := 'platinum';
  ELSIF NEW.visit_count >= 10 THEN
    NEW.rank := 'gold';
  ELSIF NEW.visit_count >= 5 THEN
    NEW.rank := 'silver';
  ELSIF NEW.visit_count >= 1 THEN
    NEW.rank := 'bronze';
  ELSE
    NEW.rank := 'new';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー
DROP TRIGGER IF EXISTS trg_update_customer_rank ON customers;
CREATE TRIGGER trg_update_customer_rank
  BEFORE UPDATE OF visit_count ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_rank();
