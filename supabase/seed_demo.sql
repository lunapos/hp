-- ============================================================
-- LunaPOS デモアカウント（パブリック公開用）
-- テナントID: c0000000-0000-0000-0000-000000000001
--
-- ■ 認証情報（公開OK）
--   Floor (iPad): デバイストークン「luna-demo」
--   Admin (Web):  demo@lunapos.jp / luna1234
--   Cast (Web):   demo@lunapos.jp / luna1234
--
-- ■ 注意事項
--   - 誰でも触れる公開アカウントのため、データは定期的にリセットする想定
--   - Admin/Cast の Supabase Auth ユーザーは Supabase Dashboard で別途作成が必要
--     （user_metadata に {"tenant_id": "c0000000-0000-0000-0000-000000000001"} を設定）
--
-- 実行方法:
--   psql -f seed_demo.sql
--   または Supabase SQLエディタで実行
-- ============================================================

-- ============================================================
-- テナント（店舗）: Luna デモ店舗
-- ============================================================
INSERT INTO stores (id, name, service_rate, tax_rate, douhan_fee, nomination_fee_main, nomination_fee_in_store, invoice_registration_number)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Luna デモ店舗',
    0.400,
    0.100,
    3000,
    5000,
    2000,
    'T0000000000000'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    service_rate = EXCLUDED.service_rate,
    tax_rate = EXCLUDED.tax_rate,
    douhan_fee = EXCLUDED.douhan_fee,
    nomination_fee_main = EXCLUDED.nomination_fee_main,
    nomination_fee_in_store = EXCLUDED.nomination_fee_in_store,
    invoice_registration_number = EXCLUDED.invoice_registration_number;

-- ============================================================
-- デバイス（デモ用）
-- デバイストークン: luna-demo
-- ============================================================
INSERT INTO devices (id, tenant_id, device_name, device_token, role)
VALUES (
    'dc000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'デモ iPad',
    'luna-demo',
    'floor'
)
ON CONFLICT (id) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    device_token = EXCLUDED.device_token,
    role = EXCLUDED.role;

-- ============================================================
-- ルーム: メインフロア + VIPルーム
-- ============================================================
INSERT INTO rooms (id, tenant_id, name, sort_order) VALUES
    ('c0000001-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'メインフロア', 1),
    ('c0000001-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'VIPルーム', 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

-- ============================================================
-- テーブル: メインフロア5台 + VIP2台 = 計7台
-- ============================================================
INSERT INTO floor_tables (id, tenant_id, room_id, name, capacity, status, position_x, position_y) VALUES
    ('c0000002-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '1番', 4, 'empty', 1, 1),
    ('c0000002-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '2番', 4, 'empty', 2, 1),
    ('c0000002-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '3番', 4, 'empty', 3, 1),
    ('c0000002-0004-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '4番', 4, 'empty', 1, 2),
    ('c0000002-0005-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '5番', 6, 'empty', 2, 2),
    ('c0000002-0006-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0002-0000-0000-000000000001', 'VIP1', 6, 'empty', 1, 1),
    ('c0000002-0007-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0002-0000-0000-000000000001', 'VIP2', 8, 'empty', 2, 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    capacity = EXCLUDED.capacity,
    status = EXCLUDED.status,
    position_x = EXCLUDED.position_x,
    position_y = EXCLUDED.position_y;

-- ============================================================
-- キャスト5名
-- ============================================================
INSERT INTO casts (id, tenant_id, stage_name, real_name, is_active) VALUES
    ('c0000003-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'あかり', 'デモ太郎A', true),
    ('c0000003-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'みお',   'デモ太郎B', true),
    ('c0000003-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'はるか', 'デモ太郎C', true),
    ('c0000003-0004-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ゆき',   'デモ太郎D', true),
    ('c0000003-0005-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'りの',   'デモ太郎E', true)
ON CONFLICT (id) DO UPDATE SET
    stage_name = EXCLUDED.stage_name,
    real_name = EXCLUDED.real_name,
    is_active = EXCLUDED.is_active;

-- ============================================================
-- 出勤シフト（デモ用: 常に出勤中のキャストがいる状態）
-- ============================================================
INSERT INTO cast_shifts (id, tenant_id, cast_id, clock_in, clock_out, scheduled_clock_in, scheduled_clock_out) VALUES
    ('c0000010-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000003-0001-0000-0000-000000000001', NOW() - INTERVAL '2 hours', NULL, '20:00', '01:00'),
    ('c0000010-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000003-0002-0000-0000-000000000001', NOW() - INTERVAL '1 hour', NULL, '21:00', '02:00'),
    ('c0000010-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000003-0003-0000-0000-000000000001', NOW() - INTERVAL '3 hours', NULL, '19:00', '00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- メニュー: ドリンク5品 + ボトル3品 + フード3品 + レディースドリンク1品 = 12品
-- ============================================================
INSERT INTO menu_items (id, tenant_id, name, price, category, is_active, sort_order) VALUES
    ('c0000004-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ビール',             800,  'drink', true, 1),
    ('c0000004-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ハイボール',         700,  'drink', true, 2),
    ('c0000004-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'カクテル',           900,  'drink', true, 3),
    ('c0000004-0004-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ソフトドリンク',     500,  'drink', true, 4),
    ('c0000004-0005-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'シャンパン(グラス)', 5000, 'drink', true, 5),
    ('c0000004-0006-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ウイスキーボトル',   8000,  'bottle', true, 1),
    ('c0000004-0007-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'シャンパンボトル',   30000, 'bottle', true, 2),
    ('c0000004-0008-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ドンペリ',           50000, 'bottle', true, 3),
    ('c0000004-0009-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'おつまみセット',     800,  'food', true, 1),
    ('c0000004-0010-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'フルーツ盛り',       1500, 'food', true, 2),
    ('c0000004-0011-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'チーズ盛り',         1200, 'food', true, 3),
    ('c0000004-0012-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'レディースドリンク', 1500, 'ladies_drink', true, 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

-- ============================================================
-- セットプラン: 60分 / 90分 / 120分
-- ============================================================
INSERT INTO set_plans (id, tenant_id, name, duration_minutes, price, is_active) VALUES
    ('c0000005-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '60分セット',  60,  5000, true),
    ('c0000005-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '90分セット',  90,  7000, true),
    ('c0000005-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '120分セット', 120, 9000, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    duration_minutes = EXCLUDED.duration_minutes,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active;

-- ============================================================
-- 顧客データ
-- ============================================================
INSERT INTO customers (id, tenant_id, name, phone, visit_count, total_spend, notes, rank, favorite_cast_id) VALUES
    ('c0000006-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'デモ田中様', '090-0000-0001', 10, 200000, 'ウイスキー好き', 'vip', 'c0000003-0001-0000-0000-000000000001'),
    ('c0000006-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'デモ山田様', '090-0000-0002', 3, 50000, NULL, 'repeat', 'c0000003-0002-0000-0000-000000000001'),
    ('c0000006-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'デモ佐藤様', NULL, 1, 15000, NULL, 'new', NULL)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    visit_count = EXCLUDED.visit_count,
    total_spend = EXCLUDED.total_spend;

-- ============================================================
-- サンプル来店・会計データ（過去3日分）
-- デモで売上データが見える状態にしておく
-- ============================================================

-- 来店1: 現金（2日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, extension_minutes, is_checked_out) VALUES
    ('c0000020-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000002-0001-0000-0000-000000000001', 'デモ田中様', 2, 1, NOW() - INTERVAL '2 days' + INTERVAL '20 hours', NOW() - INTERVAL '2 days' + INTERVAL '21 hours', 60, 0, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO nominations (id, tenant_id, visit_id, cast_id, nomination_type, qty) VALUES
    ('c0000021-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000020-0001-0000-0000-000000000001', 'c0000003-0001-0000-0000-000000000001', 'main', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_items (id, tenant_id, visit_id, menu_item_id, menu_item_name, price, quantity, is_expense) VALUES
    ('c0000022-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000020-0001-0000-0000-000000000001', 'c0000004-0001-0000-0000-000000000001', 'ビール', 800, 3, false),
    ('c0000022-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000020-0001-0000-0000-000000000001', 'c0000004-0009-0000-0000-000000000001', 'おつまみセット', 800, 1, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('c0000023-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000020-0001-0000-0000-000000000001', 'c0000002-0001-0000-0000-000000000001', 'デモ田中様', 16200, 0, 5000, 6480, 2268, 0, 24948, 'cash', NOW() - INTERVAL '2 days' + INTERVAL '21 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店2: カード（昨日）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('c0000020-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000002-0006-0000-0000-000000000001', 'デモ山田様', 3, 1, NOW() - INTERVAL '1 day' + INTERVAL '20 hours', NOW() - INTERVAL '1 day' + INTERVAL '22 hours', 90, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO nominations (id, tenant_id, visit_id, cast_id, nomination_type, qty) VALUES
    ('c0000021-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000020-0002-0000-0000-000000000001', 'c0000003-0002-0000-0000-000000000001', 'in_store', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('c0000023-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000020-0002-0000-0000-000000000001', 'c0000002-0006-0000-0000-000000000001', 'デモ山田様', 22000, 0, 2000, 8800, 3080, 0, 33880, 'credit', NOW() - INTERVAL '1 day' + INTERVAL '22 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店3: 現金・割引あり（今日）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('c0000020-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000002-0003-0000-0000-000000000001', 'デモ佐藤様', 2, 0, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 60, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('c0000023-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000020-0003-0000-0000-000000000001', 'c0000002-0003-0000-0000-000000000001', 'デモ佐藤様', 8000, 0, 0, 3200, 1120, 1000, 11320, 'cash', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;
