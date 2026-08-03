-- cryptly.memberships の self_select policy が自テーブルを EXISTS で参照しており
-- "infinite recursion detected in policy for relation memberships" を引き起こしていた。
-- 自分のmembership行のみを見られるシンプルなpolicyに置き換える。
-- 他メンバー一覧が必要になったら SECURITY DEFINER 関数で別途公開する。

drop policy if exists memberships_self_select on cryptly.memberships;

create policy memberships_self_select on cryptly.memberships
  for select using (user_id = auth.uid());
