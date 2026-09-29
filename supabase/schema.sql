-- Run this in the Supabase SQL editor.
-- Stores extended profile data (name + date of birth) for each auth user.

create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  full_name text not null,
  date_of_birth date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read and update only their own profile.
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow the app to insert a profile row at signup time (insert happens with the auth user's token).
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Keep updated_at in sync.
create or replace function public.handle_profile_updated()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_profile_updated();

-- Expenses
-- Stores an expense (in naira) made by a user on a given day.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null default 'Other',
  spent_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_user_spent_on
  on public.expenses (user_id, spent_on desc);

-- Backs the dashboard search filter, which matches descriptions with ILIKE.
create extension if not exists pg_trgm;

create index if not exists expenses_title_trgm
  on public.expenses using gin (title gin_trgm_ops);

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

create trigger on_expense_updated
  before update on public.expenses
  for each row execute function public.handle_profile_updated();