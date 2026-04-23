-- visits: 卓単位のサービス料・消費税スキップフラグを追加
ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS skip_service_fee boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skip_tax         boolean NOT NULL DEFAULT false;
