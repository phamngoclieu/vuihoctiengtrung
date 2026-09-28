create table if not exists public.vocabulary_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hsk_level smallint not null check (hsk_level between 1 and 9),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  session_state jsonb not null check (jsonb_typeof(session_state) = 'object'),
  current_index integer not null default 0 check (current_index >= 0),
  total_questions integer not null check (total_questions >= 4),
  first_try_correct integer not null default 0 check (first_try_correct >= 0),
  ever_wrong integer not null default 0 check (ever_wrong >= 0),
  revealed_answers integer not null default 0 check (revealed_answers >= 0),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check (current_index <= total_questions),
  check (first_try_correct <= total_questions and ever_wrong <= total_questions and revealed_answers <= total_questions),
  check ((status = 'in_progress' and completed_at is null) or (status = 'completed' and completed_at is not null and current_index = total_questions))
);

create unique index if not exists vocabulary_practice_one_active_idx
on public.vocabulary_practice_sessions (user_id, hsk_level)
where status = 'in_progress';

create index if not exists vocabulary_practice_user_history_idx
on public.vocabulary_practice_sessions (user_id, hsk_level, started_at desc);

create index if not exists vocabulary_practice_level_history_idx
on public.vocabulary_practice_sessions (hsk_level, started_at desc);

drop trigger if exists vocabulary_practice_sessions_touch_updated_at on public.vocabulary_practice_sessions;
create trigger vocabulary_practice_sessions_touch_updated_at
before update on public.vocabulary_practice_sessions
for each row execute function private.touch_updated_at();

alter table public.vocabulary_practice_sessions enable row level security;

drop policy if exists vocabulary_practice_select on public.vocabulary_practice_sessions;
create policy vocabulary_practice_select
on public.vocabulary_practice_sessions for select to authenticated
using (user_id = (select auth.uid()) or private.is_staff());

drop policy if exists vocabulary_practice_insert on public.vocabulary_practice_sessions;
create policy vocabulary_practice_insert
on public.vocabulary_practice_sessions for insert to authenticated
with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists vocabulary_practice_update on public.vocabulary_practice_sessions;
create policy vocabulary_practice_update
on public.vocabulary_practice_sessions for update to authenticated
using (user_id = (select auth.uid()) or private.is_admin())
with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists vocabulary_practice_delete_admin on public.vocabulary_practice_sessions;
create policy vocabulary_practice_delete_admin
on public.vocabulary_practice_sessions for delete to authenticated
using (private.is_admin());

revoke all on public.vocabulary_practice_sessions from anon, authenticated;
grant select, insert, update, delete on public.vocabulary_practice_sessions to authenticated;
