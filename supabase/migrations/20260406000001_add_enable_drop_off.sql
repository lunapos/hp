-- stores テーブルに送り先機能フラグを追加
ALTER TABLE stores ADD COLUMN IF NOT EXISTS enable_drop_off BOOLEAN NOT NULL DEFAULT true;

-- アップス（本番テナント）は送り先機能を無効化
UPDATE stores SET enable_drop_off = false WHERE name = 'アップス';
