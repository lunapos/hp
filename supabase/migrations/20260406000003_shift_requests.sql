-- シフト希望テーブル
-- キャストが翌月のシフト希望を提出するためのテーブル
CREATE TABLE shift_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    cast_id UUID NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,  -- 希望開始時刻
    end_time TIME NOT NULL,    -- 希望終了時刻
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, cast_id, date)  -- 1日1件まで
);

CREATE INDEX idx_shift_requests_tenant ON shift_requests(tenant_id);
CREATE INDEX idx_shift_requests_cast ON shift_requests(cast_id);
CREATE INDEX idx_shift_requests_date ON shift_requests(date);

ALTER TABLE shift_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY shift_requests_tenant_isolation ON shift_requests FOR ALL USING (tenant_id = public.tenant_id());
