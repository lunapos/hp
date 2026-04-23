-- casts テーブルに auth_user_id カラムを追加
ALTER TABLE casts ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 既存のキャストアカウントと紐づけ（user_metadata.cast_id から逆引き）
-- ※ 新規作成時は cast-signup Edge Function で設定する
CREATE UNIQUE INDEX IF NOT EXISTS casts_auth_user_id_unique ON casts(auth_user_id) WHERE auth_user_id IS NOT NULL;
