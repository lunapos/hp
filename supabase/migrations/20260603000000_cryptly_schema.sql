-- Cryptly 用スキーマを luna hp Supabase に同居させる（Phase 0 開発期間中の暫定措置）
-- 本番化時は独立 Supabase プロジェクトに移行する想定
--
-- 元ファイル: cryptly/supabase/migrations/20260601*.sql を統合し、
-- public スキーマへの参照を cryptly スキーマに書き換えたもの。

create schema if not exists cryptly;
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================================
-- テーブル
-- ============================================================

create table cryptly.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  plan text not null default 'free' check (plan in ('free','personal','startup','business','enterprise')),
  fiscal_year_end_month smallint not null default 3 check (fiscal_year_end_month between 1 and 12),
  created_at timestamptz not null default now()
);

create table cryptly.memberships (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index on cryptly.memberships(user_id);
create index on cryptly.memberships(tenant_id);

create table cryptly.wallets (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  label text not null,
  chain text not null check (chain in ('ethereum','solana','polygon','bsc','arbitrum','optimism','base','bitcoin','other')),
  address text not null,
  purpose text check (purpose in ('investment','operating','trading','staking','other')),
  created_at timestamptz not null default now()
);

create index on cryptly.wallets(tenant_id);

create table cryptly.exchange_accounts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  exchange text not null check (exchange in ('binance','bitflyer','coincheck','bitbank','bybit','kraken','other')),
  label text not null,
  api_key_encrypted text,
  created_at timestamptz not null default now()
);

create index on cryptly.exchange_accounts(tenant_id);

create table cryptly.transactions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  wallet_id uuid references cryptly.wallets(id) on delete set null,
  exchange_account_id uuid references cryptly.exchange_accounts(id) on delete set null,
  occurred_at timestamptz not null,
  type text not null check (type in ('deposit','withdrawal','swap','transfer','staking_reward','airdrop','nft_buy','nft_sell','defi_lp_add','defi_lp_remove','fee','other')),
  asset_in text,
  amount_in numeric(38, 18),
  asset_in_contract text,
  asset_out text,
  amount_out numeric(38, 18),
  asset_out_contract text,
  fee_asset text,
  fee_amount numeric(38, 18),
  price_jpy_at numeric(20, 4),
  tx_hash text,
  source_tx_id text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create index on cryptly.transactions(tenant_id, occurred_at desc);
create index on cryptly.transactions(wallet_id);
create index on cryptly.transactions(exchange_account_id);
create unique index transactions_wallet_source_unique
  on cryptly.transactions (wallet_id, source_tx_id)
  where source_tx_id is not null;
create index transactions_tx_hash_idx on cryptly.transactions (tx_hash);

create table cryptly.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  transaction_id uuid references cryptly.transactions(id) on delete set null,
  entry_date date not null,
  debit_account text not null,
  credit_account text not null,
  amount_jpy numeric(20, 4) not null,
  memo text,
  exported_to text check (exported_to in ('freee','mfcloud',null)),
  status text not null default 'pending' check (status in ('pending','confirmed','manual')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index on cryptly.journal_entries(tenant_id, entry_date desc);
create index journal_entries_status on cryptly.journal_entries(tenant_id, status, entry_date desc);

create table cryptly.period_end_valuations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  period_end_date date not null,
  asset text not null,
  holding_amount numeric(38, 18) not null,
  unit_price_jpy numeric(20, 4) not null,
  total_value_jpy numeric(20, 4) not null,
  is_taxable boolean not null default true,
  purpose text,
  created_at timestamptz not null default now(),
  unique (tenant_id, period_end_date, asset)
);

create table cryptly.price_cache (
  coin_id text not null,
  price_date date not null,
  price_jpy numeric(20, 4) not null,
  source text not null default 'coingecko',
  created_at timestamptz not null default now(),
  primary key (coin_id, price_date)
);

create table cryptly.asset_lots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  asset text not null,
  acquired_at timestamptz not null,
  remaining_amount numeric(38, 18) not null,
  unit_cost_jpy numeric(20, 4) not null,
  source_transaction_id uuid references cryptly.transactions(id) on delete set null,
  created_at timestamptz not null default now()
);

create index asset_lots_tenant_asset on cryptly.asset_lots(tenant_id, asset, acquired_at);

create table cryptly.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_tenant_time on cryptly.audit_logs(tenant_id, created_at desc);

create table cryptly.invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','member','viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index invitations_tenant on cryptly.invitations(tenant_id);
create index invitations_token on cryptly.invitations(token);

create table cryptly.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references cryptly.tenants(id) on delete cascade,
  wallet_id uuid references cryptly.wallets(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','error')),
  fetched_count int default 0,
  inserted_count int default 0,
  journal_count int default 0,
  error_message text
);

create index sync_jobs_tenant_time on cryptly.sync_jobs(tenant_id, started_at desc);

-- ============================================================
-- 整合性 CHECK 制約
-- ============================================================

alter table cryptly.journal_entries
  add constraint journal_entries_amount_positive check (amount_jpy >= 0);

alter table cryptly.transactions
  add constraint transactions_amounts_nonneg check (
    (amount_in is null or amount_in >= 0)
    and (amount_out is null or amount_out >= 0)
    and (fee_amount is null or fee_amount >= 0)
  );

alter table cryptly.asset_lots
  add constraint asset_lots_remaining_nonneg check (remaining_amount >= 0);

alter table cryptly.wallets
  add constraint wallets_address_format check (
    length(address) between 20 and 100
    and address !~ '[\s\n\r\t]'
  );

create unique index wallets_tenant_address_unique
  on cryptly.wallets (tenant_id, chain, address);

-- ============================================================
-- RLS
-- ============================================================

alter table cryptly.tenants enable row level security;
alter table cryptly.memberships enable row level security;
alter table cryptly.wallets enable row level security;
alter table cryptly.exchange_accounts enable row level security;
alter table cryptly.transactions enable row level security;
alter table cryptly.journal_entries enable row level security;
alter table cryptly.period_end_valuations enable row level security;
alter table cryptly.price_cache enable row level security;
alter table cryptly.asset_lots enable row level security;
alter table cryptly.audit_logs enable row level security;
alter table cryptly.invitations enable row level security;
alter table cryptly.sync_jobs enable row level security;

create policy "tenants_member_select" on cryptly.tenants
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = tenants.id and m.user_id = auth.uid())
  );

create policy "tenants_update" on cryptly.tenants
  for update using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = tenants.id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  ) with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = tenants.id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "memberships_self_select" on cryptly.memberships
  for select using (user_id = auth.uid() or exists (
    select 1 from cryptly.memberships m2 where m2.tenant_id = memberships.tenant_id and m2.user_id = auth.uid() and m2.role in ('owner','admin')
  ));

create policy "memberships_admin_insert" on cryptly.memberships
  for insert with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = memberships.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "memberships_admin_update" on cryptly.memberships
  for update using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = memberships.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  ) with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = memberships.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "memberships_admin_delete" on cryptly.memberships
  for delete using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = memberships.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "wallets_select" on cryptly.wallets
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = wallets.tenant_id and m.user_id = auth.uid())
  );
create policy "wallets_insert" on cryptly.wallets
  for insert with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = wallets.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin','member')
    )
  );
create policy "wallets_update" on cryptly.wallets
  for update using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = wallets.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin','member')
    )
  ) with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = wallets.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin','member')
    )
  );
create policy "wallets_delete" on cryptly.wallets
  for delete using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = wallets.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "exchange_accounts_select" on cryptly.exchange_accounts
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = exchange_accounts.tenant_id and m.user_id = auth.uid())
  );
create policy "exchange_accounts_write" on cryptly.exchange_accounts
  for all using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = exchange_accounts.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  ) with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = exchange_accounts.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "transactions_select" on cryptly.transactions
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = transactions.tenant_id and m.user_id = auth.uid())
  );

create policy "journal_entries_select" on cryptly.journal_entries
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = journal_entries.tenant_id and m.user_id = auth.uid())
  );
create policy "journal_entries_insert" on cryptly.journal_entries
  for insert with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = journal_entries.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin','member')
    )
  );
create policy "journal_entries_update" on cryptly.journal_entries
  for update using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = journal_entries.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin','member')
    )
  ) with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = journal_entries.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin','member')
    )
  );
create policy "journal_entries_delete" on cryptly.journal_entries
  for delete using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = journal_entries.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "period_end_valuations_select" on cryptly.period_end_valuations
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = period_end_valuations.tenant_id and m.user_id = auth.uid())
  );

create policy "price_cache_read_all" on cryptly.price_cache
  for select using (auth.role() = 'authenticated');

create policy "asset_lots_select" on cryptly.asset_lots
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = asset_lots.tenant_id and m.user_id = auth.uid())
  );

create policy "audit_logs_tenant_member" on cryptly.audit_logs
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = audit_logs.tenant_id and m.user_id = auth.uid())
  );

create policy "invitations_admin_all" on cryptly.invitations
  for all using (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = invitations.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  ) with check (
    exists (
      select 1 from cryptly.memberships m
      where m.tenant_id = invitations.tenant_id and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

create policy "sync_jobs_tenant_member" on cryptly.sync_jobs
  for select using (
    exists (select 1 from cryptly.memberships m where m.tenant_id = sync_jobs.tenant_id and m.user_id = auth.uid())
  );

-- ============================================================
-- 関数・トリガー
-- ============================================================

-- 初回ログイン時にテナント+ownerメンバーシップを自動作成
create or replace function cryptly.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = cryptly, public
as $$
declare
  new_tenant_id uuid;
begin
  insert into cryptly.tenants (name, plan)
  values (coalesce(new.raw_user_meta_data->>'company', new.email), 'free')
  returning id into new_tenant_id;

  insert into cryptly.memberships (tenant_id, user_id, role)
  values (new_tenant_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_cryptly on auth.users;
create trigger on_auth_user_created_cryptly
  after insert on auth.users
  for each row execute function cryptly.handle_new_user();

-- 不変フィールド保護
create or replace function cryptly.guard_transaction_immutable()
returns trigger
language plpgsql
as $$
begin
  if old.tenant_id is distinct from new.tenant_id then
    raise exception 'tenant_id is immutable';
  end if;
  if old.wallet_id is distinct from new.wallet_id then
    raise exception 'wallet_id is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_transactions_immutable on cryptly.transactions;
create trigger trg_transactions_immutable
  before update on cryptly.transactions
  for each row execute function cryptly.guard_transaction_immutable();

create or replace function cryptly.guard_journal_immutable()
returns trigger
language plpgsql
as $$
begin
  if old.tenant_id is distinct from new.tenant_id then
    raise exception 'tenant_id is immutable';
  end if;
  if old.transaction_id is distinct from new.transaction_id then
    raise exception 'transaction_id is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_journal_immutable on cryptly.journal_entries;
create trigger trg_journal_immutable
  before update on cryptly.journal_entries
  for each row execute function cryptly.guard_journal_immutable();

-- 招待トークン照会
create or replace function cryptly.fetch_invitation_by_token(p_token text)
returns table (
  id uuid,
  tenant_id uuid,
  email text,
  role text,
  expires_at timestamptz,
  accepted_at timestamptz
)
language plpgsql
security definer
set search_path = cryptly, public
as $$
begin
  return query
  select i.id, i.tenant_id, i.email, i.role, i.expires_at, i.accepted_at
  from cryptly.invitations i
  where i.token = p_token
  limit 1;
end;
$$;

revoke all on function cryptly.fetch_invitation_by_token(text) from public;
grant execute on function cryptly.fetch_invitation_by_token(text) to authenticated;

-- 招待承諾
create or replace function cryptly.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = cryptly, public
as $$
declare
  v_invitation cryptly.invitations%rowtype;
  v_user_email text;
begin
  select email into v_user_email from auth.users where id = auth.uid();
  if v_user_email is null then
    raise exception 'not authenticated';
  end if;

  select * into v_invitation from cryptly.invitations where token = p_token limit 1;
  if v_invitation.id is null then
    raise exception 'invitation not found';
  end if;
  if v_invitation.accepted_at is not null then
    raise exception 'invitation already accepted';
  end if;
  if v_invitation.expires_at < now() then
    raise exception 'invitation expired';
  end if;
  if lower(v_invitation.email) <> lower(v_user_email) then
    raise exception 'invitation email mismatch';
  end if;

  insert into cryptly.memberships (tenant_id, user_id, role)
  values (v_invitation.tenant_id, auth.uid(), v_invitation.role)
  on conflict (tenant_id, user_id) do nothing;

  update cryptly.invitations set accepted_at = now() where id = v_invitation.id;

  insert into cryptly.audit_logs (tenant_id, actor_user_id, action, entity_type, entity_id)
  values (v_invitation.tenant_id, auth.uid(), 'invitation.accept', 'invitation', v_invitation.id::text);

  return v_invitation.tenant_id;
end;
$$;

revoke all on function cryptly.accept_invitation(text) from public;
grant execute on function cryptly.accept_invitation(text) to authenticated;

-- ============================================================
-- API 公開設定（PostgREST から cryptly スキーマへアクセスできるように）
-- ============================================================

grant usage on schema cryptly to anon, authenticated, service_role;
grant all on all tables in schema cryptly to anon, authenticated, service_role;
grant all on all sequences in schema cryptly to anon, authenticated, service_role;
grant all on all functions in schema cryptly to anon, authenticated, service_role;

alter default privileges in schema cryptly grant all on tables to anon, authenticated, service_role;
alter default privileges in schema cryptly grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema cryptly grant all on functions to anon, authenticated, service_role;
