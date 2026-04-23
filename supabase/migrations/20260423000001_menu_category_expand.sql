-- menu_items: カテゴリを bottle → 5分類に拡張
-- 既存の bottle カテゴリを champagne にマイグレーション（ボトル=シャンパンが大半のため）
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check
  CHECK (category IN ('drink', 'whisky', 'shochu', 'champagne', 'red_wine', 'white_wine', 'food', 'ladies_drink', 'other'));

UPDATE menu_items SET category = 'champagne' WHERE category = 'bottle';
