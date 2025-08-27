-- Risk profile on user_profiles
alter table if exists public.user_profiles
  add column if not exists risk_profile text;

-- Watchlist table: one row per user, array of scheme_codes
create table if not exists public.watchlist (
  user_id uuid primary key references auth.users(id) on delete cascade,
  scheme_codes text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- User investments table to hold portfolio entries
create table if not exists public.user_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheme_code text not null,
  units numeric not null check (units >= 0),
  avg_nav numeric not null check (avg_nav >= 0),
  invested_amount numeric not null check (invested_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_user_investments_user on public.user_investments(user_id);
create index if not exists idx_user_investments_scheme on public.user_investments(scheme_code);

-- User goals table
create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_user_goals_user on public.user_goals(user_id);

-- RLS policies
alter table public.watchlist enable row level security;
alter table public.user_investments enable row level security;
alter table public.user_goals enable row level security;

-- Ensure user_profiles RLS already exists; add policy to allow user to update own risk_profile
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_profiles' and policyname = 'Users can update own profile risk_profile'
  ) then
    create policy "Users can update own profile risk_profile" on public.user_profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- Watchlist policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'watchlist' and policyname = 'Users can select own watchlist'
  ) then
    create policy "Users can select own watchlist" on public.watchlist for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'watchlist' and policyname = 'Users can upsert own watchlist'
  ) then
    create policy "Users can upsert own watchlist" on public.watchlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Investments policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_investments' and policyname = 'Users can manage own investments'
  ) then
    create policy "Users can manage own investments" on public.user_investments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- Goals policies
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'user_goals' and policyname = 'Users can manage own goals'
  ) then
    create policy "Users can manage own goals" on public.user_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;


