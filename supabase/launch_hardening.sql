-- Launch hardening setup for PrepBros
-- Run this in the Supabase SQL editor before public launch.

create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date text not null,
  duration text not null default '60 minutes',
  topics text not null,
  prize text not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'past')),
  winner text,
  your_rank integer,
  created_at timestamptz not null default now()
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  category text not null,
  subject text not null,
  message text not null,
  source text not null default 'support_page',
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.support_replies (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests(id) on delete cascade,
  to_email text not null,
  subject text not null,
  message text not null,
  sent_by_email text not null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.contests enable row level security;
alter table public.support_requests enable row level security;
alter table public.support_replies enable row level security;

drop policy if exists "public read contests" on public.contests;
create policy "public read contests"
on public.contests
for select
to anon, authenticated
using (true);

drop policy if exists "admin write contests" on public.contests;
create policy "admin write contests"
on public.contests
for all
to authenticated
using (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com')
with check (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com');

drop policy if exists "public insert support requests" on public.support_requests;
create policy "public insert support requests"
on public.support_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "admin read support requests" on public.support_requests;
create policy "admin read support requests"
on public.support_requests
for select
to authenticated
using (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com');

drop policy if exists "admin update support requests" on public.support_requests;
create policy "admin update support requests"
on public.support_requests
for update
to authenticated
using (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com')
with check (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com');

drop policy if exists "admin read support replies" on public.support_replies;
create policy "admin read support replies"
on public.support_replies
for select
to authenticated
using (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com');

drop policy if exists "admin insert support replies" on public.support_replies;
create policy "admin insert support replies"
on public.support_replies
for insert
to authenticated
with check (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com');

alter table public.profiles add column if not exists state text;
