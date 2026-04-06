create extension if not exists pgcrypto with schema extensions;

alter table public.profiles
add column if not exists first_access boolean not null default true;

create table if not exists public.company (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null,
  website_url text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists company_profile_id_idx on public.company (profile_id);

alter table public.company enable row level security;

drop trigger if exists set_public_company_updated_at on public.company;

create trigger set_public_company_updated_at
before update on public.company
for each row execute procedure public.set_updated_at();

drop policy if exists "Users can view their own company" on public.company;
create policy "Users can view their own company"
on public.company
for select
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Users can insert their own company" on public.company;
create policy "Users can insert their own company"
on public.company
for insert
to authenticated
with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can update their own company" on public.company;
create policy "Users can update their own company"
on public.company
for update
to authenticated
using ((select auth.uid()) = profile_id)
with check ((select auth.uid()) = profile_id);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.company (id) on delete cascade,
  domain text not null,
  normalized_domain text not null,
  source text not null default 'manual' check (source in ('manual', 'suggested')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, normalized_domain)
);

create index if not exists competitors_owner_id_idx on public.competitors (owner_id);
create index if not exists competitors_company_id_idx on public.competitors (company_id);

alter table public.competitors enable row level security;

drop trigger if exists set_public_competitors_updated_at on public.competitors;

create trigger set_public_competitors_updated_at
before update on public.competitors
for each row execute procedure public.set_updated_at();

drop policy if exists "Users can view their own competitors" on public.competitors;
create policy "Users can view their own competitors"
on public.competitors
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Users can insert their own competitors" on public.competitors;
create policy "Users can insert their own competitors"
on public.competitors
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can update their own competitors" on public.competitors;
create policy "Users can update their own competitors"
on public.competitors
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can delete their own competitors" on public.competitors;
create policy "Users can delete their own competitors"
on public.competitors
for delete
to authenticated
using ((select auth.uid()) = owner_id);
