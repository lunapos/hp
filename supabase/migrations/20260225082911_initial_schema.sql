-- ============================================================
-- LunaPOS Initial Schema
-- Multi-tenant対応、全テーブルにtenant_id + RLS
-- ============================================================

-- gen_random_uuid() is built-in since PostgreSQL 13

-- ============================================================
-- stores: テナント（店舗）+ 料金設定
-- ============================================================
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    service_rate NUMERIC(4,3) NOT NULL DEFAULT 0.400,
    tax_rate NUMERIC(4,3) NOT NULL DEFAULT 0.100,
    douhan_fee INTEGER NOT NULL DEFAULT 3000,
    nomination_fee_main INTEGER NOT NULL DEFAULT 5000,
    nomination_fee_in_store INTEGER NOT NULL DEFAULT 2000,
    invoice_registration_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- devices: iPad端末認証
-- ============================================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    device_token TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'floor' CHECK (role IN ('floor', 'admin', 'cast')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_devices_tenant ON devices(tenant_id);

-- ============================================================
-- rooms
-- ============================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rooms_tenant ON rooms(tenant_id);

-- ============================================================
-- casts: キャスト基本情報（マスタデータ）
-- ============================================================
CREATE TABLE casts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    real_name TEXT NOT NULL DEFAULT '',
    photo_url TEXT,
    drop_off_location TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_casts_tenant ON casts(tenant_id);

-- ============================================================
-- customers
-- ============================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    visit_count INTEGER NOT NULL DEFAULT 0,
    total_spend INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    rank TEXT NOT NULL DEFAULT 'new' CHECK (rank IN ('new', 'repeat', 'vip')),
    favorite_cast_id UUID REFERENCES casts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);

-- ============================================================
-- menu_items
-- ============================================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('drink', 'bottle', 'food', 'ladies_drink', 'other')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id);

-- ============================================================
-- set_plans
-- ============================================================
CREATE TABLE set_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_set_plans_tenant ON set_plans(tenant_id);

-- ============================================================
-- floor_tables
-- ============================================================
CREATE TABLE floor_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'waiting_checkout')),
    position_x INTEGER NOT NULL DEFAULT 1,
    position_y INTEGER NOT NULL DEFAULT 1,
    visit_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_floor_tables_tenant ON floor_tables(tenant_id);
CREATE INDEX idx_floor_tables_room ON floor_tables(room_id);

-- ============================================================
-- visits: 来店（メイン取引エンティティ）
-- ============================================================
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES floor_tables(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    guest_count INTEGER NOT NULL DEFAULT 1,
    douhan_cast_id UUID REFERENCES casts(id) ON DELETE SET NULL,
    douhan_qty INTEGER NOT NULL DEFAULT 1,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    check_out_time TIMESTAMPTZ,
    set_minutes INTEGER NOT NULL DEFAULT 60,
    extension_minutes INTEGER NOT NULL DEFAULT 0,
    set_price_override INTEGER,
    douhan_fee_override INTEGER,
    is_checked_out BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_visits_tenant ON visits(tenant_id);
CREATE INDEX idx_visits_table ON visits(table_id);
CREATE INDEX idx_visits_checkin ON visits(tenant_id, check_in_time);

-- floor_tables.visit_id FK（循環参照のため後から追加）
ALTER TABLE floor_tables
    ADD CONSTRAINT fk_floor_tables_visit
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL;

-- ============================================================
-- nominations: 指名（Visit子テーブル、正規化）
-- ============================================================
CREATE TABLE nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    cast_id UUID NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
    nomination_type TEXT NOT NULL CHECK (nomination_type IN ('none', 'in_store', 'main')),
    qty INTEGER NOT NULL DEFAULT 1,
    fee_override INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_nominations_visit ON nominations(visit_id);
CREATE INDEX idx_nominations_tenant ON nominations(tenant_id);

-- ============================================================
-- order_items: 注文（Visit子テーブル、正規化）
-- ============================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL,
    menu_item_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_expense BOOLEAN NOT NULL DEFAULT false,
    cast_id UUID REFERENCES casts(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_visit ON order_items(visit_id);
CREATE INDEX idx_order_items_tenant ON order_items(tenant_id);

-- ============================================================
-- payments: 会計
-- ============================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES floor_tables(id) ON DELETE CASCADE,
    customer_name TEXT,
    subtotal INTEGER NOT NULL DEFAULT 0,
    expense_total INTEGER NOT NULL DEFAULT 0,
    nomination_fee INTEGER NOT NULL DEFAULT 0,
    service_fee INTEGER NOT NULL DEFAULT 0,
    tax INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit', 'electronic', 'tab')),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_visit ON payments(visit_id);

-- ============================================================
-- payment_items: 会計明細スナップショット
-- ============================================================
CREATE TABLE payment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL,
    menu_item_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_expense BOOLEAN NOT NULL DEFAULT false,
    cast_id UUID REFERENCES casts(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_items_payment ON payment_items(payment_id);

-- ============================================================
-- cast_shifts: 出勤記録（履歴管理）
-- ============================================================
CREATE TABLE cast_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    cast_id UUID NOT NULL REFERENCES casts(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out TIMESTAMPTZ,
    scheduled_clock_in TEXT,
    scheduled_clock_out TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cast_shifts_tenant ON cast_shifts(tenant_id);
CREATE INDEX idx_cast_shifts_cast ON cast_shifts(cast_id);

-- ============================================================
-- cash_withdrawals: 出金記録
-- ============================================================
CREATE TABLE cash_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cash_withdrawals_tenant ON cash_withdrawals(tenant_id);

-- ============================================================
-- register_sessions: レジ開始金額（日別）
-- ============================================================
CREATE TABLE register_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    business_date DATE NOT NULL,
    start_amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, business_date)
);
CREATE INDEX idx_register_sessions_tenant ON register_sessions(tenant_id);

-- ============================================================
-- bottles: ボトルキープ（将来用）
-- ============================================================
CREATE TABLE bottles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bottles_tenant ON bottles(tenant_id);

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- ============================================================
-- RLS: Row Level Security
-- ============================================================

-- tenant_id取得ヘルパー（JWTクレームから）
CREATE OR REPLACE FUNCTION public.tenant_id()
RETURNS UUID AS $$
    SELECT COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'tenant_id')::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
    );
$$ LANGUAGE SQL STABLE;

-- 全テーブルRLS有効化 + ポリシー
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY stores_tenant_isolation ON stores FOR ALL USING (id = public.tenant_id());

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY devices_tenant_isolation ON devices FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY rooms_tenant_isolation ON rooms FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE casts ENABLE ROW LEVEL SECURITY;
CREATE POLICY casts_tenant_isolation ON casts FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_tenant_isolation ON customers FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY menu_items_tenant_isolation ON menu_items FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE set_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY set_plans_tenant_isolation ON set_plans FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE floor_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY floor_tables_tenant_isolation ON floor_tables FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY visits_tenant_isolation ON visits FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY nominations_tenant_isolation ON nominations FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_tenant_isolation ON order_items FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_tenant_isolation ON payments FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_items_tenant_isolation ON payment_items FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE cast_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY cast_shifts_tenant_isolation ON cast_shifts FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE cash_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY cash_withdrawals_tenant_isolation ON cash_withdrawals FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE register_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY register_sessions_tenant_isolation ON register_sessions FOR ALL USING (tenant_id = public.tenant_id());

ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
CREATE POLICY bottles_tenant_isolation ON bottles FOR ALL USING (tenant_id = public.tenant_id());
