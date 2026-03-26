-- Support reply history for admin inbox workflow.
-- Run this in the Supabase SQL editor after launch_hardening.sql.

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

alter table public.support_replies enable row level security;

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
