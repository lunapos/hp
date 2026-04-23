-- デモ店舗のボトルメニューを元に戻す
UPDATE menu_items SET name = 'ウイスキーボトル' WHERE id = 'c0000004-0007-0000-0000-000000000001';
UPDATE menu_items SET name = '焼酎ボトル' WHERE id = 'c0000004-0006-0000-0000-000000000001';
UPDATE menu_items SET name = 'シャンパンボトル' WHERE id = 'c0000004-0009-0000-0000-000000000001';
UPDATE menu_items SET name = 'ワインボトル' WHERE id = 'c0000004-0008-0000-0000-000000000001';
UPDATE menu_items SET name = 'ドンペリ', price = 50000 WHERE id = 'c0000004-0010-0000-0000-000000000001';
