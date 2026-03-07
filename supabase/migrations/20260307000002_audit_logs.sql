-- ============================================================
-- Phase 3.3: 操作ログ（audit_logs）テーブル
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id TEXT,               -- 操作者（端末名 or ユーザーID）
    action TEXT NOT NULL,       -- 操作種別（create, update, delete, checkout, cancel, discount等）
    target_table TEXT NOT NULL,  -- 対象テーブル名
    target_id UUID,             -- 対象レコードID
    old_value JSONB,            -- 変更前の値
    new_value JSONB,            -- 変更後の値
    ip_address TEXT,            -- IPアドレス
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_date ON audit_logs(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_table ON audit_logs(tenant_id, target_table);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(tenant_id, action);

-- RLS: 管理者のみ読み取り可能
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- テナント内のデータのみ参照可能なポリシー
CREATE POLICY audit_logs_tenant_read ON audit_logs
    FOR SELECT
    USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

-- テナント内のデータのみ挿入可能
CREATE POLICY audit_logs_tenant_insert ON audit_logs
    FOR INSERT
    WITH CHECK (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');
