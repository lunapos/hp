-- デモ店舗（Luna デモ店舗）のボトルメニューを更新
UPDATE menu_items SET name = 'ウイスキー', is_active = true
WHERE id = 'c0000004-0007-0000-0000-000000000001';

UPDATE menu_items SET name = '焼酎', is_active = true
WHERE id = 'c0000004-0006-0000-0000-000000000001';

UPDATE menu_items SET name = 'シャンパン', is_active = true
WHERE id = 'c0000004-0009-0000-0000-000000000001';

-- ワインボトルを赤ワインに変更
UPDATE menu_items SET name = '赤ワイン', is_active = true
WHERE id = 'c0000004-0008-0000-0000-000000000001';

-- ドンペリを白ワインに変更
UPDATE menu_items SET name = '白ワイン', price = 18000, is_active = true
WHERE id = 'c0000004-0010-0000-0000-000000000001';
