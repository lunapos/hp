-- menu_items の category CHECK制約を更新（bottle廃止、酒類5カテゴリに分割）
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check
    CHECK (category IN ('drink', 'whisky', 'shochu', 'champagne', 'red_wine', 'white_wine', 'food', 'ladies_drink', 'other', 'bottle'));

-- デモ店舗（Luna デモ店舗 c0000000...）のボトルメニューをカテゴリ別に更新
UPDATE menu_items SET category = 'whisky'    WHERE id = 'c0000004-0007-0000-0000-000000000001';
UPDATE menu_items SET category = 'shochu'    WHERE id = 'c0000004-0006-0000-0000-000000000001';
UPDATE menu_items SET category = 'champagne' WHERE id = 'c0000004-0009-0000-0000-000000000001';
UPDATE menu_items SET category = 'red_wine'  WHERE id = 'c0000004-0008-0000-0000-000000000001';
UPDATE menu_items SET category = 'white_wine' WHERE id = 'c0000004-0010-0000-0000-000000000001';
