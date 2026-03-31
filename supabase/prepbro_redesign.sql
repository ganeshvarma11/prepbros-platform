-- PrepBros redesign session persistence
-- Run this in the Supabase SQL editor after launch_hardening.sql.

create table if not exists public.practice_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null,
  subject text not null,
  total_questions integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  skipped_count integer not null default 0,
  duration_sec integer not null default 0,
  accuracy integer not null default 0,
  leaderboard_name text,
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists practice_sessions_user_completed_idx
  on public.practice_sessions (user_id, completed_at desc);

alter table public.practice_sessions enable row level security;

drop policy if exists "users read own practice sessions" on public.practice_sessions;
create policy "users read own practice sessions"
on public.practice_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users insert own practice sessions" on public.practice_sessions;
create policy "users insert own practice sessions"
on public.practice_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users update own practice sessions" on public.practice_sessions;
create policy "users update own practice sessions"
on public.practice_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
