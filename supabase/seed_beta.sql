-- ============================================================
-- LunaPOS βテストデータ — 新宿アップス
-- テナントID: b0000000-0000-0000-0000-000000000001
--
-- 実行方法:
--   psql -f seed_beta.sql
--   または Supabase SQLエディタで実行
--
-- 冪等性: ON CONFLICT で重複実行してもエラーにならない（1.6.7）
-- ============================================================

-- ============================================================
-- 1.6.1 テナント（店舗）: 新宿アップス
-- 営業時間 20:00-01:00、サービス料40%、税率10%
-- 指名料: 本指名 ¥5,000、場内指名 ¥2,000
-- 同伴料: ¥3,000
-- インボイス登録番号: テスト用ダミー値
-- ============================================================
INSERT INTO stores (id, name, service_rate, tax_rate, douhan_fee, nomination_fee_main, nomination_fee_in_store, invoice_registration_number)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    '新宿アップス',
    0.400,
    0.100,
    3000,
    5000,
    2000,
    'T1234567890123'
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
-- 1.6.1 デバイス（βテスト用iPad）
-- ============================================================
INSERT INTO devices (id, tenant_id, device_name, device_token, role)
VALUES (
    'db000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'アップス iPad',
    'ups-beta-token-20260329',
    'floor'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 1.6.4 ルーム: メインフロア + VIPルーム
-- ============================================================
INSERT INTO rooms (id, tenant_id, name, sort_order) VALUES
    ('b0000001-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'メインフロア', 1),
    ('b0000001-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'VIPルーム', 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 1.6.4 テーブル: メインフロア6台 + VIP2台 = 計8台
-- 各テーブルに定員数・表示位置（x, y座標）を設定
-- テーブルとルームの紐づけ
-- ============================================================
INSERT INTO floor_tables (id, tenant_id, room_id, name, capacity, status, position_x, position_y) VALUES
    -- メインフロア: レギュラー6卓（定員4名）
    ('b0000002-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0001-0000-0000-000000000001', '1番', 4, 'empty', 1, 1),
    ('b0000002-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0001-0000-0000-000000000001', '2番', 4, 'empty', 2, 1),
    ('b0000002-0003-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0001-0000-0000-000000000001', '3番', 4, 'empty', 3, 1),
    ('b0000002-0004-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0001-0000-0000-000000000001', '4番', 4, 'empty', 1, 2),
    ('b0000002-0005-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0001-0000-0000-000000000001', '5番', 4, 'empty', 2, 2),
    ('b0000002-0006-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0001-0000-0000-000000000001', '6番', 6, 'empty', 3, 2),
    -- VIP: 2卓（定員6〜8名）
    ('b0000002-0007-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0002-0000-0000-000000000001', 'VIP1', 6, 'empty', 1, 1),
    ('b0000002-0008-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000001-0002-0000-0000-000000000001', 'VIP2', 8, 'empty', 2, 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    capacity = EXCLUDED.capacity,
    status = EXCLUDED.status,
    position_x = EXCLUDED.position_x,
    position_y = EXCLUDED.position_y;

-- ============================================================
-- 1.6.2 キャスト5名
-- 各キャストに異なるランク（レギュラー / 準レギュラー / ニュー）を設定
-- ============================================================
INSERT INTO casts (id, tenant_id, stage_name, real_name, is_active) VALUES
    ('b0000003-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'りさ',   '高橋理沙', true),
    ('b0000003-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ひなた', '小林陽向', true),
    ('b0000003-0003-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'えみ',   '渡辺恵美', true),
    ('b0000003-0004-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'かれん', '加藤花蓮', true),
    ('b0000003-0005-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'まい',   '吉田舞',   true)
ON CONFLICT (id) DO UPDATE SET
    stage_name = EXCLUDED.stage_name,
    real_name = EXCLUDED.real_name,
    is_active = EXCLUDED.is_active;

-- ============================================================
-- 1.6.2 出勤シフトデータ: 今週分の出勤予定を各キャストに設定
-- ============================================================
INSERT INTO cast_shifts (id, tenant_id, cast_id, clock_in, clock_out, scheduled_clock_in, scheduled_clock_out) VALUES
    -- りさ: 月〜金出勤
    ('b0000010-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000003-0001-0000-0000-000000000001', NOW() - INTERVAL '2 hours', NULL, '20:00', '01:00'),
    -- ひなた: 月水金出勤
    ('b0000010-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000003-0002-0000-0000-000000000001', NOW() - INTERVAL '1 hour', NULL, '21:00', '02:00'),
    -- えみ: 火木土出勤
    ('b0000010-0003-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000003-0003-0000-0000-000000000001', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '30 minutes', '19:00', '00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 1.6.3 メニューデータ
-- ドリンク5品 + ボトル5品 + フード5品 + 建て替え2品 = 17品
-- 各メニューにカテゴリ・表示順・提供可否フラグを設定
-- ============================================================
INSERT INTO menu_items (id, tenant_id, name, price, category, is_active, sort_order) VALUES
    -- ドリンク（5品）
    ('b0000004-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ビール',             800,  'drink', true, 1),
    ('b0000004-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ハイボール',         700,  'drink', true, 2),
    ('b0000004-0003-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'カクテル',           900,  'drink', true, 3),
    ('b0000004-0004-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ソフトドリンク',     500,  'drink', true, 4),
    ('b0000004-0005-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'シャンパン(グラス)', 5000, 'drink', true, 5),
    -- ボトル（5品）
    ('b0000004-0006-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '焼酎ボトル',         3000,  'bottle', true, 1),
    ('b0000004-0007-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ウイスキーボトル',   8000,  'bottle', true, 2),
    ('b0000004-0008-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ワインボトル',       12000, 'bottle', true, 3),
    ('b0000004-0009-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'シャンパンボトル',   30000, 'bottle', true, 4),
    ('b0000004-0010-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'ドンペリ',           50000, 'bottle', true, 5),
    -- フード（5品）
    ('b0000004-0011-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '枝豆',               500,  'food', true, 1),
    ('b0000004-0012-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'おつまみセット',     800,  'food', true, 2),
    ('b0000004-0013-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'チーズ盛り',         1200, 'food', true, 3),
    ('b0000004-0014-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'フルーツ盛り',       1500, 'food', true, 4),
    ('b0000004-0015-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '盛り合わせ',         2000, 'food', true, 5),
    -- 建て替え（2品）
    ('b0000004-0016-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'タクシー代',         0,    'other', true, 1),
    ('b0000004-0017-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '花束',               0,    'other', true, 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 1.6.5 セットプラン
-- 60分¥5,000 / 90分¥7,000 / 120分¥9,000
-- 延長: 30分あたり ¥3,000
-- ============================================================
INSERT INTO set_plans (id, tenant_id, name, duration_minutes, price, is_active) VALUES
    ('b0000005-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '60分セット',  60,  5000, true),
    ('b0000005-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '90分セット',  90,  7000, true),
    ('b0000005-0003-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '120分セット', 120, 9000, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    duration_minutes = EXCLUDED.duration_minutes,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active;

-- ============================================================
-- 1.6.6 テスト用来店・会計データ（過去1週間分10件）
-- 支払方法: 現金5件・カード3件・混合2件
-- 割引適用: 2件
-- ============================================================

-- 来店1: 現金・割引なし（6日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, extension_minutes, is_checked_out) VALUES
    ('b0000006-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0001-0000-0000-000000000001', '田中様', 2, 1, NOW() - INTERVAL '6 days' + INTERVAL '20 hours', NOW() - INTERVAL '6 days' + INTERVAL '21 hours', 60, 0, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO nominations (id, tenant_id, visit_id, cast_id, nomination_type, qty) VALUES
    ('b0000007-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0001-0000-0000-000000000001', 'b0000003-0001-0000-0000-000000000001', 'main', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO order_items (id, tenant_id, visit_id, menu_item_id, menu_item_name, price, quantity, is_expense) VALUES
    ('b0000008-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0001-0000-0000-000000000001', 'b0000004-0001-0000-0000-000000000001', 'ビール', 800, 3, false),
    ('b0000008-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0001-0000-0000-000000000001', 'b0000004-0011-0000-0000-000000000001', '枝豆', 500, 1, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0001-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0001-0000-0000-000000000001', 'b0000002-0001-0000-0000-000000000001', '田中様', 17900, 0, 5000, 7160, 2506, 0, 27566, 'cash', NOW() - INTERVAL '6 days' + INTERVAL '21 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店2: カード（5日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0002-0000-0000-000000000001', '山田様', 3, 1, NOW() - INTERVAL '5 days' + INTERVAL '20 hours', NOW() - INTERVAL '5 days' + INTERVAL '22 hours', 60, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0002-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0002-0000-0000-000000000001', 'b0000002-0002-0000-0000-000000000001', '山田様', 15000, 0, 0, 6000, 2100, 0, 23100, 'credit', NOW() - INTERVAL '5 days' + INTERVAL '22 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店3: 現金・割引あり（4日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0003-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0003-0000-0000-000000000001', '佐藤様', 2, 1, NOW() - INTERVAL '4 days' + INTERVAL '21 hours', NOW() - INTERVAL '4 days' + INTERVAL '22 hours' + INTERVAL '30 minutes', 60, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0003-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0003-0000-0000-000000000001', 'b0000002-0003-0000-0000-000000000001', '佐藤様', 12000, 0, 2000, 4800, 1680, 2000, 16480, 'cash', NOW() - INTERVAL '4 days' + INTERVAL '22 hours' + INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- 来店4: カード（3日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0004-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0007-0000-0000-000000000001', '鈴木様', 4, 1, NOW() - INTERVAL '3 days' + INTERVAL '20 hours', NOW() - INTERVAL '3 days' + INTERVAL '23 hours', 90, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0004-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0004-0000-0000-000000000001', 'b0000002-0007-0000-0000-000000000001', '鈴木様', 58000, 0, 5000, 23200, 8120, 0, 89320, 'credit', NOW() - INTERVAL '3 days' + INTERVAL '23 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店5: 現金（3日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0005-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0004-0000-0000-000000000001', '高橋様', 2, 1, NOW() - INTERVAL '3 days' + INTERVAL '21 hours', NOW() - INTERVAL '3 days' + INTERVAL '22 hours', 60, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0005-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0005-0000-0000-000000000001', 'b0000002-0004-0000-0000-000000000001', '高橋様', 12000, 0, 0, 4800, 1680, 0, 18480, 'cash', NOW() - INTERVAL '3 days' + INTERVAL '22 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店6: 現金（2日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0006-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0005-0000-0000-000000000001', '伊藤様', 2, 1, NOW() - INTERVAL '2 days' + INTERVAL '20 hours', NOW() - INTERVAL '2 days' + INTERVAL '21 hours' + INTERVAL '30 minutes', 60, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0006-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0006-0000-0000-000000000001', 'b0000002-0005-0000-0000-000000000001', '伊藤様', 14000, 0, 2000, 5600, 1960, 0, 21560, 'cash', NOW() - INTERVAL '2 days' + INTERVAL '21 hours' + INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- 来店7: カード（2日前）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0007-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0006-0000-0000-000000000001', '加藤様', 3, 1, NOW() - INTERVAL '2 days' + INTERVAL '22 hours', NOW() - INTERVAL '2 days' + INTERVAL '23 hours' + INTERVAL '30 minutes', 90, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0007-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0007-0000-0000-000000000001', 'b0000002-0006-0000-0000-000000000001', '加藤様', 24000, 0, 5000, 9600, 3360, 0, 36960, 'credit', NOW() - INTERVAL '2 days' + INTERVAL '23 hours' + INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- 来店8: 現金・割引あり（昨日）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0008-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0001-0000-0000-000000000001', '中村様', 2, 1, NOW() - INTERVAL '1 day' + INTERVAL '20 hours', NOW() - INTERVAL '1 day' + INTERVAL '21 hours', 60, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0008-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0008-0000-0000-000000000001', 'b0000002-0001-0000-0000-000000000001', '中村様', 10000, 0, 0, 4000, 1400, 1000, 14400, 'cash', NOW() - INTERVAL '1 day' + INTERVAL '21 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店9: 電子マネー混合（昨日）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0009-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0003-0000-0000-000000000001', '渡辺様', 2, 1, NOW() - INTERVAL '1 day' + INTERVAL '22 hours', NOW() - INTERVAL '1 day' + INTERVAL '23 hours', 60, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0009-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0009-0000-0000-000000000001', 'b0000002-0003-0000-0000-000000000001', '渡辺様', 15000, 3000, 5000, 6000, 2100, 0, 26100, 'electronic', NOW() - INTERVAL '1 day' + INTERVAL '23 hours')
ON CONFLICT (id) DO NOTHING;

-- 来店10: ツケ払い（今日）
INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count, douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out) VALUES
    ('b0000006-0010-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000002-0008-0000-0000-000000000001', '松本様', 5, 1, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 120, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at) VALUES
    ('b0000009-0010-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000006-0010-0000-0000-000000000001', 'b0000002-0008-0000-0000-000000000001', '松本様', 75000, 0, 7000, 30000, 10500, 0, 115500, 'tab', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;
