-- ============================================================
-- LunaPOS デモアカウント（パブリック公開用）
-- テナントID: c0000000-0000-0000-0000-000000000001
--
-- ■ 認証情報（公開OK）
--   Floor (iPad): デバイストークン「luna-demo」
--   Admin (Web):  demo-admin@lunapos.jp / luna-admin-demo
--   Cast (Web):   demo-cast@lunapos.jp  / luna-cast-demo
--
-- ■ 設定
--   新宿アップスと同じ料金設定を使用
--   サービス料40%、税率10%
--   本指名¥5,000、場内指名¥2,000、同伴¥3,000
--
-- ■ 注意事項
--   - 誰でも触れる公開アカウントのため、データは定期的にリセット推奨
--   - Admin/Cast の Supabase Auth ユーザーは Supabase Dashboard で別途作成が必要
--     （user_metadata に {"tenant_id": "c0000000-0000-0000-0000-000000000001"} を設定）
--
-- 実行方法:
--   Supabase SQLエディタで実行（冪等: 何度実行してもOK）
-- ============================================================

-- ============================================================
-- テナント（店舗）: Luna デモ店舗
-- アップスと同じ料金設定
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
-- デバイス（Floor iPad用）
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
    ('c0000001-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'VIPルーム',   2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

-- ============================================================
-- テーブル: メインフロア6台 + VIP2台 = 計8台
-- アップスと同じ構成
-- ============================================================
INSERT INTO floor_tables (id, tenant_id, room_id, name, capacity, status, position_x, position_y) VALUES
    ('c0000002-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '1番', 4, 'empty', 1, 1),
    ('c0000002-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '2番', 4, 'empty', 2, 1),
    ('c0000002-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '3番', 4, 'empty', 3, 1),
    ('c0000002-0004-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '4番', 4, 'empty', 1, 2),
    ('c0000002-0005-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '5番', 4, 'empty', 2, 2),
    ('c0000002-0006-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0001-0000-0000-000000000001', '6番', 6, 'empty', 3, 2),
    ('c0000002-0007-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0002-0000-0000-000000000001', 'VIP1', 6, 'empty', 1, 1),
    ('c0000002-0008-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000001-0002-0000-0000-000000000001', 'VIP2', 8, 'empty', 2, 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    capacity = EXCLUDED.capacity,
    status = EXCLUDED.status,
    position_x = EXCLUDED.position_x,
    position_y = EXCLUDED.position_y;

-- ============================================================
-- キャスト8名（ダミー）
-- ============================================================
INSERT INTO casts (id, tenant_id, stage_name, real_name, is_active) VALUES
    ('c0000003-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'あかり', 'デモ 明里', true),
    ('c0000003-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'みお',   'デモ 美緒', true),
    ('c0000003-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'はるか', 'デモ 晴花', true),
    ('c0000003-0004-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ゆき',   'デモ 雪',   true),
    ('c0000003-0005-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'りの',   'デモ 莉乃', true),
    ('c0000003-0006-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'なな',   'デモ 七海', true),
    ('c0000003-0007-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'さや',   'デモ 沙也', true),
    ('c0000003-0008-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'えみ',   'デモ 恵美', true)
ON CONFLICT (id) DO UPDATE SET
    stage_name = EXCLUDED.stage_name,
    real_name = EXCLUDED.real_name,
    is_active = EXCLUDED.is_active;

-- ============================================================
-- 出勤シフト（デモ用: 複数キャストが出勤中の状態）
-- ============================================================
INSERT INTO cast_shifts (id, tenant_id, cast_id, clock_in, clock_out, scheduled_clock_in, scheduled_clock_out) VALUES
    ('c0000010-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000003-0001-0000-0000-000000000001', NOW() - INTERVAL '2 hours', NULL, '20:00', '01:00'),
    ('c0000010-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000003-0002-0000-0000-000000000001', NOW() - INTERVAL '1 hour',  NULL, '21:00', '02:00'),
    ('c0000010-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000003-0003-0000-0000-000000000001', NOW() - INTERVAL '3 hours', NULL, '19:00', '00:00'),
    ('c0000010-0004-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000003-0004-0000-0000-000000000001', NOW() - INTERVAL '90 minutes', NULL, '20:30', '01:30')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- メニュー: アップスと同じ構成
-- ドリンク5品 + ボトル5品 + フード5品 + その他2品 + レディースドリンク1品
-- ============================================================
INSERT INTO menu_items (id, tenant_id, name, price, category, is_active, sort_order) VALUES
    -- ドリンク
    ('c0000004-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ビール',             800,   'drink',        true, 1),
    ('c0000004-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ハイボール',         700,   'drink',        true, 2),
    ('c0000004-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'カクテル',           900,   'drink',        true, 3),
    ('c0000004-0004-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ソフトドリンク',     500,   'drink',        true, 4),
    ('c0000004-0005-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'シャンパン(グラス)', 5000,  'drink',        true, 5),
    -- ボトル
    ('c0000004-0006-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '焼酎ボトル',         3000,  'bottle',       true, 1),
    ('c0000004-0007-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ウイスキーボトル',   8000,  'bottle',       true, 2),
    ('c0000004-0008-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ワインボトル',       12000, 'bottle',       true, 3),
    ('c0000004-0009-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'シャンパンボトル',   30000, 'bottle',       true, 4),
    ('c0000004-0010-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ドンペリ',           50000, 'bottle',       true, 5),
    -- フード
    ('c0000004-0011-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '枝豆',               500,   'food',         true, 1),
    ('c0000004-0012-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'おつまみセット',     800,   'food',         true, 2),
    ('c0000004-0013-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'チーズ盛り',         1200,  'food',         true, 3),
    ('c0000004-0014-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'フルーツ盛り',       1500,  'food',         true, 4),
    ('c0000004-0015-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '盛り合わせ',         2000,  'food',         true, 5),
    -- レディースドリンク
    ('c0000004-0016-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'レディースドリンク', 1500,  'ladies_drink', true, 1),
    -- 建て替え（経費）
    ('c0000004-0017-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'タクシー代',         0,     'other',        true, 1),
    ('c0000004-0018-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '花束',               0,     'other',        true, 2)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

-- ============================================================
-- セットプラン: アップスと同じ（60分/90分/120分）
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
-- 顧客データ（ダミー）
-- ============================================================
INSERT INTO customers (id, tenant_id, name, visit_count, total_spend, notes, rank, favorite_cast_id) VALUES
    ('c0000006-0001-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'デモ田中様', 10, 200000, 'ウイスキー好き',   'vip',    'c0000003-0001-0000-0000-000000000001'),
    ('c0000006-0002-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'デモ山田様', 3,  50000,  NULL,              'repeat', 'c0000003-0002-0000-0000-000000000001'),
    ('c0000006-0003-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'デモ佐藤様', 1,  15000,  NULL,              'new',    NULL)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    visit_count = EXCLUDED.visit_count,
    total_spend = EXCLUDED.total_spend;

-- ============================================================
-- サンプル来店・会計データ（過去3日分）
-- IDに gen_random_uuid() を使うことで、reset_demo.sql → seed_demo.sql の
-- 順で実行するたびに「その日から過去3日」のデータになる。
-- ============================================================
DO $$
DECLARE
  v1 UUID := gen_random_uuid();
  v2 UUID := gen_random_uuid();
  v3 UUID := gen_random_uuid();
  v4 UUID := gen_random_uuid();  -- あかり 同伴
  v5 UUID := gen_random_uuid();  -- あかり 場内指名
  v6 UUID := gen_random_uuid();  -- あかり 本指名（今日）
BEGIN

  -- ── 来店1: 田中様・本指名（あかり）・同伴・2日前 ──────────────────
  INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count,
      douhan_cast_id, douhan_qty, check_in_time, check_out_time, set_minutes, extension_minutes, is_checked_out)
  VALUES (v1, 'c0000000-0000-0000-0000-000000000001', 'c0000002-0001-0000-0000-000000000001',
      'デモ田中様', 2,
      'c0000003-0001-0000-0000-000000000001', 1,
      NOW() - INTERVAL '2 days' + INTERVAL '11 hours',
      NOW() - INTERVAL '2 days' + INTERVAL '12 hours',
      60, 0, true);
  INSERT INTO nominations (id, tenant_id, visit_id, cast_id, nomination_type, qty)
  VALUES (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v1, 'c0000003-0001-0000-0000-000000000001', 'main', 1);
  INSERT INTO order_items (id, tenant_id, visit_id, menu_item_id, menu_item_name, price, quantity, is_expense, cast_id)
  VALUES
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v1, 'c0000004-0016-0000-0000-000000000001', 'レディースドリンク', 1500, 3, false, 'c0000003-0001-0000-0000-000000000001'),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v1, 'c0000004-0002-0000-0000-000000000001', 'ハイボール', 700, 4, false, 'c0000003-0001-0000-0000-000000000001'),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v1, 'c0000004-0011-0000-0000-000000000001', '枝豆', 500, 1, false, NULL);
  -- 小計: セット5000 + 同伴3000 + 本指名5000 + レディース×3(4500) + ハイボール×4(2800) + 枝豆(500) = 20800
  -- サービス料(40%): 8320、消費税(10%): 2912、合計: 32032
  INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name,
      subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at)
  VALUES (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v1, 'c0000002-0001-0000-0000-000000000001',
      'デモ田中様', 20800, 0, 5000, 8320, 2912, 0, 32032, 'cash',
      NOW() - INTERVAL '2 days' + INTERVAL '12 hours');

  -- ── 来店2: 山田様・場内指名（あかり）・昨日 ──────────────────────
  INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count,
      douhan_qty, check_in_time, check_out_time, set_minutes, extension_minutes, is_checked_out)
  VALUES (v2, 'c0000000-0000-0000-0000-000000000001', 'c0000002-0007-0000-0000-000000000001',
      'デモ山田様', 3, 0,
      NOW() - INTERVAL '1 day' + INTERVAL '11 hours',
      NOW() - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes',
      60, 30, true);
  INSERT INTO nominations (id, tenant_id, visit_id, cast_id, nomination_type, qty)
  VALUES (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v2, 'c0000003-0001-0000-0000-000000000001', 'in_store', 1);
  INSERT INTO order_items (id, tenant_id, visit_id, menu_item_id, menu_item_name, price, quantity, is_expense, cast_id)
  VALUES
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v2, 'c0000004-0016-0000-0000-000000000001', 'レディースドリンク', 1500, 2, false, 'c0000003-0001-0000-0000-000000000001'),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v2, 'c0000004-0001-0000-0000-000000000001', 'ビール', 800, 3, false, NULL);
  -- 小計: セット5000 + 延長3000 + 場内指名2000 + レディース×2(3000) + ビール×3(2400) = 15400
  -- サービス料(40%): 6160、消費税(10%): 2156、合計: 23716
  INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name,
      subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at)
  VALUES (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v2, 'c0000002-0007-0000-0000-000000000001',
      'デモ山田様', 15400, 0, 2000, 6160, 2156, 0, 23716, 'credit',
      NOW() - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes');

  -- ── 来店3: 佐藤様・指名なし・昨日（割引あり） ────────────────────
  INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count,
      douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out)
  VALUES (v3, 'c0000000-0000-0000-0000-000000000001', 'c0000002-0003-0000-0000-000000000001',
      'デモ佐藤様', 2, 0,
      NOW() - INTERVAL '1 day' + INTERVAL '13 hours',
      NOW() - INTERVAL '1 day' + INTERVAL '14 hours',
      60, true);
  INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name,
      subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at)
  VALUES (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v3, 'c0000002-0003-0000-0000-000000000001',
      'デモ佐藤様', 8000, 0, 0, 3200, 1120, 1000, 11320, 'cash',
      NOW() - INTERVAL '1 day' + INTERVAL '14 hours');

  -- ── 来店4: 伊藤様・本指名（あかり）・シャンパン・今日 ─────────────
  INSERT INTO visits (id, tenant_id, table_id, customer_name, guest_count,
      douhan_qty, check_in_time, check_out_time, set_minutes, is_checked_out)
  VALUES (v4, 'c0000000-0000-0000-0000-000000000001', 'c0000002-0005-0000-0000-000000000001',
      'デモ伊藤様', 2, 0,
      NOW() - INTERVAL '3 hours',
      NOW() - INTERVAL '1 hour 30 minutes',
      90, true);
  INSERT INTO nominations (id, tenant_id, visit_id, cast_id, nomination_type, qty)
  VALUES (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v4, 'c0000003-0001-0000-0000-000000000001', 'main', 1);
  INSERT INTO order_items (id, tenant_id, visit_id, menu_item_id, menu_item_name, price, quantity, is_expense, cast_id)
  VALUES
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v4, 'c0000004-0016-0000-0000-000000000001', 'レディースドリンク', 1500, 4, false, 'c0000003-0001-0000-0000-000000000001'),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v4, 'c0000004-0009-0000-0000-000000000001', 'シャンパンボトル', 30000, 1, false, NULL),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v4, 'c0000004-0014-0000-0000-000000000001', 'フルーツ盛り', 1500, 1, false, NULL);
  -- 小計: セット7000 + 本指名5000 + レディース×4(6000) + シャンパン(30000) + フルーツ(1500) = 49500
  -- サービス料(40%): 19800、消費税(10%): 6930、合計: 76230
  INSERT INTO payments (id, tenant_id, visit_id, table_id, customer_name,
      subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at)
  VALUES (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', v4, 'c0000002-0005-0000-0000-000000000001',
      'デモ伊藤様', 49500, 0, 5000, 19800, 6930, 0, 76230, 'cash',
      NOW() - INTERVAL '1 hour 30 minutes');

END $$;
