-- stores テーブルに最低必要バージョンカラムを追加
-- アプリ起動時にこの値と比較し、古いバージョンは強制アップデート
alter table stores
  add column if not exists min_required_version text not null default '1.0.0';
