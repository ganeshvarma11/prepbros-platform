-- Exam and job updates table for the public /updates page and admin workflow.
-- Run this in the Supabase SQL editor.

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  exam_type text not null,
  state text not null default 'All India',
  qualification text not null,
  eligibility text not null,
  application_start date not null,
  last_date date not null,
  exam_window text not null,
  updated_at date not null default current_date,
  summary text not null,
  tags text[] not null default '{}',
  apply_url text not null,
  notice_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint updates_exam_type_check check (
    exam_type in ('SSC', 'Banking', 'State PSC', 'Railways', 'Police', 'Defence', 'PSU', 'Teaching')
  ),
  constraint updates_qualification_check check (
    qualification in ('10th Pass', '12th Pass', 'Diploma / ITI', 'Graduate', 'Postgraduate')
  ),
  constraint updates_date_check check (application_start <= last_date)
);

create index if not exists updates_is_active_idx on public.updates (is_active);
create index if not exists updates_last_date_idx on public.updates (last_date);
create index if not exists updates_exam_type_idx on public.updates (exam_type);
create index if not exists updates_state_idx on public.updates (state);

alter table public.updates enable row level security;

drop policy if exists "public read active updates" on public.updates;
create policy "public read active updates"
on public.updates
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admin write updates" on public.updates;
create policy "admin write updates"
on public.updates
for all
to authenticated
using (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com')
with check (auth.jwt() ->> 'email' = 'rakeshmeesa631@gmail.com');
