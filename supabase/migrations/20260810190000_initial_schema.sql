-- Học tiếng Trung LiuLiuLiu · nền tảng HSK 3.0
-- Toàn bộ dữ liệu học viên được bảo vệ bằng Row Level Security.

create extension if not exists pgcrypto;
create schema if not exists private;

revoke all on schema private from public, anon;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role text not null default 'student' check (role in ('owner', 'admin', 'teacher', 'student')),
  ui_language text not null default 'vi' check (ui_language in ('vi', 'en', 'zh')),
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role);
create index profiles_locked_at_idx on public.profiles (locked_at) where locked_at is not null;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('owner', 'admin', 'teacher')
      and locked_at is null
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('owner', 'admin')
      and locked_at is null
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, 'Học viên'), '@', 1)),
    case when lower(coalesce(new.email, '')) = 'phamngoclieu1501@gmail.com' then 'owner' else 'student' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- A signed-in user may never change their own role, lock state, or profile
  -- email. The owner account is also immutable through the public API.
  if old.role = 'owner' or (select auth.uid()) = old.id then
    new.role = old.role;
    new.locked_at = old.locked_at;
    new.email = old.email;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row execute function private.protect_profile_privileges();

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();

revoke all on function private.is_staff() from public, anon;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.protect_profile_privileges() from public, anon, authenticated;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_staff(), private.is_admin() to authenticated;

create table public.courses (
  id text primary key,
  title text not null,
  level text not null,
  description_vi text,
  description_en text,
  description_zh text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_created_by_idx on public.courses (created_by);

create table public.lessons (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  lesson_number integer not null check (lesson_number > 0),
  title_zh text not null,
  pinyin text,
  title_vi text,
  title_en text,
  objectives jsonb not null default '[]'::jsonb,
  source_coverage jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, lesson_number)
);

create index lessons_course_status_idx on public.lessons (course_id, status, lesson_number);
create index lessons_created_by_idx on public.lessons (created_by);
create index lessons_updated_by_idx on public.lessons (updated_by);

create table public.vocabulary (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  hanzi text not null,
  pinyin text not null,
  han_viet text,
  part_of_speech_vi text,
  part_of_speech_en text,
  meaning_vi text not null,
  meaning_en text not null,
  source_note text,
  review_flag text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, hanzi, pinyin)
);

create index vocabulary_lesson_status_idx on public.vocabulary (lesson_id, status, sort_order);

create table public.vocabulary_examples (
  id bigint generated always as identity primary key,
  vocabulary_id text not null references public.vocabulary(id) on delete cascade,
  text_zh text not null,
  pinyin text,
  translation_vi text,
  translation_en text,
  source_note text,
  sort_order integer not null default 0
);

create index vocabulary_examples_vocabulary_idx on public.vocabulary_examples (vocabulary_id, sort_order);

create table public.grammar_points (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  title_vi text not null,
  title_en text,
  title_zh text,
  explanation_vi text not null,
  explanation_en text,
  examples jsonb not null default '[]'::jsonb,
  source_note text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index grammar_points_lesson_status_idx on public.grammar_points (lesson_id, status, sort_order);

create table public.dialogues (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  title_vi text not null,
  title_en text,
  title_zh text,
  context_vi text,
  context_en text,
  tip_vi text,
  media_asset_id bigint,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dialogues_lesson_status_idx on public.dialogues (lesson_id, status, sort_order);

create table public.dialogue_lines (
  id bigint generated always as identity primary key,
  dialogue_id text not null references public.dialogues(id) on delete cascade,
  speaker text not null,
  text_zh text not null,
  pinyin text,
  translation_vi text,
  translation_en text,
  sort_order integer not null default 0
);

create index dialogue_lines_dialogue_idx on public.dialogue_lines (dialogue_id, sort_order);

create table public.media_assets (
  id bigint generated always as identity primary key,
  lesson_id text references public.lessons(id) on delete cascade,
  kind text not null check (kind in ('audio', 'image')),
  purpose text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  duration_seconds numeric(10, 3),
  source_filename text,
  source_checksum text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_assets_lesson_idx on public.media_assets (lesson_id, purpose);
create index media_assets_created_by_idx on public.media_assets (created_by);

alter table public.dialogues
  add constraint dialogues_media_asset_id_fkey
  foreign key (media_asset_id) references public.media_assets(id) on delete set null;
create index dialogues_media_asset_id_idx on public.dialogues (media_asset_id);

create table public.exercises (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  section text not null check (section in ('pronunciation', 'vocabulary', 'grammar', 'dialogue', 'listening', 'quiz', 'writing')),
  exercise_type text not null,
  prompt_vi text not null,
  prompt_en text,
  prompt_zh text,
  configuration jsonb not null default '{}'::jsonb,
  answer_key jsonb not null default '{}'::jsonb,
  media_asset_id bigint references public.media_assets(id) on delete set null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercises_lesson_status_idx on public.exercises (lesson_id, status, section, sort_order);
create index exercises_media_asset_id_idx on public.exercises (media_asset_id);

create table public.user_vocabulary_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  vocabulary_id text not null references public.vocabulary(id) on delete cascade,
  memory_status text not null default 'unseen' check (memory_status in ('unseen', 'forgot', 'hard', 'remembered')),
  personal_note text,
  next_review_at timestamptz,
  review_count integer not null default 0 check (review_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, vocabulary_id)
);

create index user_vocabulary_progress_review_idx on public.user_vocabulary_progress (user_id, next_review_at) where memory_status <> 'remembered';
create index user_vocabulary_progress_vocabulary_idx on public.user_vocabulary_progress (vocabulary_id);

create table public.user_lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  completed_sections text[] not null default '{}',
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  last_opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index user_lesson_progress_lesson_idx on public.user_lesson_progress (lesson_id);
create index user_lesson_progress_recent_idx on public.user_lesson_progress (user_id, last_opened_at desc);

create table public.assessment_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(8, 2) not null check (score >= 0),
  max_score numeric(8, 2) not null check (max_score > 0),
  submitted_at timestamptz not null default now()
);

create index assessment_attempts_user_exercise_idx on public.assessment_attempts (user_id, exercise_id, submitted_at desc);
create index assessment_attempts_exercise_score_idx on public.assessment_attempts (exercise_id, score desc);

create table public.shadowing_submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  submission_type text not null check (submission_type in ('official', 'composed')),
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  submitted_at timestamptz not null default now(),
  score numeric(3, 1) check (score between 0 and 10),
  teacher_comment text check (teacher_comment is null or char_length(teacher_comment) <= 2000),
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz,
  unique (user_id, lesson_id, submission_type)
);

create index shadowing_submissions_user_idx on public.shadowing_submissions (user_id, submitted_at desc);
create index shadowing_submissions_lesson_pending_idx on public.shadowing_submissions (lesson_id, submitted_at) where graded_at is null;
create index shadowing_submissions_graded_by_idx on public.shadowing_submissions (graded_by);

create table public.writing_drafts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index writing_drafts_lesson_idx on public.writing_drafts (lesson_id);

create table public.writing_submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  submitted_at timestamptz not null default now(),
  score numeric(3, 1) check (score between 0 and 10),
  teacher_comment text check (teacher_comment is null or char_length(teacher_comment) <= 2000),
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz,
  unique (user_id, lesson_id)
);

create index writing_submissions_user_idx on public.writing_submissions (user_id, submitted_at desc);
create index writing_submissions_lesson_pending_idx on public.writing_submissions (lesson_id, submitted_at) where graded_at is null;
create index writing_submissions_graded_by_idx on public.writing_submissions (graded_by);

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

create table public.content_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete set null,
  report_type text not null,
  description text not null check (char_length(trim(description)) between 5 and 5000),
  proposed_fix text,
  image_paths text[] not null default '{}',
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  handled_by uuid references public.profiles(id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_reports_status_created_idx on public.content_reports (status, created_at desc);
create index content_reports_reporter_idx on public.content_reports (reporter_id, created_at desc);
create index content_reports_lesson_idx on public.content_reports (lesson_id);
create index content_reports_handled_by_idx on public.content_reports (handled_by);

create table public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_events_user_created_idx on public.activity_events (user_id, created_at desc);
create index activity_events_lesson_created_idx on public.activity_events (lesson_id, created_at desc);

create trigger courses_touch_updated_at before update on public.courses for each row execute function private.touch_updated_at();
create trigger lessons_touch_updated_at before update on public.lessons for each row execute function private.touch_updated_at();
create trigger vocabulary_touch_updated_at before update on public.vocabulary for each row execute function private.touch_updated_at();
create trigger grammar_points_touch_updated_at before update on public.grammar_points for each row execute function private.touch_updated_at();
create trigger dialogues_touch_updated_at before update on public.dialogues for each row execute function private.touch_updated_at();
create trigger exercises_touch_updated_at before update on public.exercises for each row execute function private.touch_updated_at();
create trigger user_vocabulary_progress_touch_updated_at before update on public.user_vocabulary_progress for each row execute function private.touch_updated_at();
create trigger user_lesson_progress_touch_updated_at before update on public.user_lesson_progress for each row execute function private.touch_updated_at();
create trigger writing_drafts_touch_updated_at before update on public.writing_drafts for each row execute function private.touch_updated_at();
create trigger content_reports_touch_updated_at before update on public.content_reports for each row execute function private.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.vocabulary enable row level security;
alter table public.vocabulary_examples enable row level security;
alter table public.grammar_points enable row level security;
alter table public.dialogues enable row level security;
alter table public.dialogue_lines enable row level security;
alter table public.media_assets enable row level security;
alter table public.exercises enable row level security;
alter table public.user_vocabulary_progress enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.shadowing_submissions enable row level security;
alter table public.writing_drafts enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.notifications enable row level security;
alter table public.content_reports enable row level security;
alter table public.activity_events enable row level security;

create policy profiles_select on public.profiles for select to authenticated
using (id = (select auth.uid()) or private.is_staff());
create policy profiles_update_self on public.profiles for update to authenticated
using (id = (select auth.uid()) or private.is_admin())
with check (id = (select auth.uid()) or private.is_admin());

create policy courses_read on public.courses for select to authenticated
using (status = 'published' or private.is_staff());
create policy courses_admin_insert on public.courses for insert to authenticated with check (private.is_admin());
create policy courses_admin_update on public.courses for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy courses_admin_delete on public.courses for delete to authenticated using (private.is_admin());

create policy lessons_read on public.lessons for select to authenticated
using (status = 'published' or private.is_staff());
create policy lessons_admin_insert on public.lessons for insert to authenticated with check (private.is_admin());
create policy lessons_admin_update on public.lessons for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy lessons_admin_delete on public.lessons for delete to authenticated using (private.is_admin());

create policy vocabulary_read on public.vocabulary for select to authenticated
using (status = 'published' or private.is_staff());
create policy vocabulary_admin_insert on public.vocabulary for insert to authenticated with check (private.is_admin());
create policy vocabulary_admin_update on public.vocabulary for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy vocabulary_admin_delete on public.vocabulary for delete to authenticated using (private.is_admin());

create policy vocabulary_examples_read on public.vocabulary_examples for select to authenticated
using (exists (select 1 from public.vocabulary v where v.id = vocabulary_id and (v.status = 'published' or private.is_staff())));
create policy vocabulary_examples_admin_insert on public.vocabulary_examples for insert to authenticated with check (private.is_admin());
create policy vocabulary_examples_admin_update on public.vocabulary_examples for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy vocabulary_examples_admin_delete on public.vocabulary_examples for delete to authenticated using (private.is_admin());

create policy grammar_read on public.grammar_points for select to authenticated
using (status = 'published' or private.is_staff());
create policy grammar_admin_insert on public.grammar_points for insert to authenticated with check (private.is_admin());
create policy grammar_admin_update on public.grammar_points for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy grammar_admin_delete on public.grammar_points for delete to authenticated using (private.is_admin());

create policy dialogues_read on public.dialogues for select to authenticated
using (status = 'published' or private.is_staff());
create policy dialogues_admin_insert on public.dialogues for insert to authenticated with check (private.is_admin());
create policy dialogues_admin_update on public.dialogues for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy dialogues_admin_delete on public.dialogues for delete to authenticated using (private.is_admin());

create policy dialogue_lines_read on public.dialogue_lines for select to authenticated
using (exists (select 1 from public.dialogues d where d.id = dialogue_id and (d.status = 'published' or private.is_staff())));
create policy dialogue_lines_admin_insert on public.dialogue_lines for insert to authenticated with check (private.is_admin());
create policy dialogue_lines_admin_update on public.dialogue_lines for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy dialogue_lines_admin_delete on public.dialogue_lines for delete to authenticated using (private.is_admin());

create policy media_assets_read on public.media_assets for select to authenticated using (true);
create policy media_assets_admin_insert on public.media_assets for insert to authenticated with check (private.is_admin());
create policy media_assets_admin_update on public.media_assets for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy media_assets_admin_delete on public.media_assets for delete to authenticated using (private.is_admin());

create policy exercises_read on public.exercises for select to authenticated
using (status = 'published' or private.is_staff());
create policy exercises_admin_insert on public.exercises for insert to authenticated with check (private.is_admin());
create policy exercises_admin_update on public.exercises for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy exercises_admin_delete on public.exercises for delete to authenticated using (private.is_admin());

create policy vocabulary_progress_select on public.user_vocabulary_progress for select to authenticated
using (user_id = (select auth.uid()) or private.is_staff());
create policy vocabulary_progress_insert on public.user_vocabulary_progress for insert to authenticated
with check (user_id = (select auth.uid()) or private.is_admin());
create policy vocabulary_progress_update on public.user_vocabulary_progress for update to authenticated
using (user_id = (select auth.uid()) or private.is_admin())
with check (user_id = (select auth.uid()) or private.is_admin());
create policy vocabulary_progress_delete on public.user_vocabulary_progress for delete to authenticated
using (user_id = (select auth.uid()) or private.is_admin());
create policy lesson_progress_select on public.user_lesson_progress for select to authenticated
using (user_id = (select auth.uid()) or private.is_staff());
create policy lesson_progress_insert on public.user_lesson_progress for insert to authenticated
with check (user_id = (select auth.uid()) or private.is_admin());
create policy lesson_progress_update on public.user_lesson_progress for update to authenticated
using (user_id = (select auth.uid()) or private.is_admin())
with check (user_id = (select auth.uid()) or private.is_admin());
create policy lesson_progress_delete on public.user_lesson_progress for delete to authenticated
using (user_id = (select auth.uid()) or private.is_admin());

create policy attempts_select on public.assessment_attempts for select to authenticated
using (user_id = (select auth.uid()) or private.is_staff());
create policy attempts_insert_own on public.assessment_attempts for insert to authenticated
with check (user_id = (select auth.uid()));

create policy shadowing_select on public.shadowing_submissions for select to authenticated
using (user_id = (select auth.uid()) or private.is_staff());
create policy shadowing_insert_once on public.shadowing_submissions for insert to authenticated
with check (user_id = (select auth.uid()));
create policy shadowing_grade_staff on public.shadowing_submissions for update to authenticated
using (private.is_staff()) with check (private.is_staff());
create policy shadowing_delete_admin on public.shadowing_submissions for delete to authenticated
using (private.is_admin());

create policy writing_drafts_own on public.writing_drafts for all to authenticated
using (user_id = (select auth.uid()) or private.is_admin())
with check (user_id = (select auth.uid()) or private.is_admin());
create policy writing_submissions_select on public.writing_submissions for select to authenticated
using (user_id = (select auth.uid()) or private.is_staff());
create policy writing_submissions_insert_once on public.writing_submissions for insert to authenticated
with check (user_id = (select auth.uid()));
create policy writing_submissions_grade_staff on public.writing_submissions for update to authenticated
using (private.is_staff()) with check (private.is_staff());
create policy writing_submissions_delete_admin on public.writing_submissions for delete to authenticated
using (private.is_admin());

create policy notifications_select_own on public.notifications for select to authenticated
using (user_id = (select auth.uid()) or private.is_admin());
create policy notifications_update_own on public.notifications for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_staff_insert on public.notifications for insert to authenticated
with check (private.is_staff());

create policy reports_select on public.content_reports for select to authenticated
using (reporter_id = (select auth.uid()) or private.is_staff());
create policy reports_insert_own on public.content_reports for insert to authenticated
with check (reporter_id = (select auth.uid()));
create policy reports_staff_update on public.content_reports for update to authenticated
using (private.is_staff()) with check (private.is_staff());

create policy activity_select on public.activity_events for select to authenticated
using (user_id = (select auth.uid()) or private.is_staff());
create policy activity_insert_own on public.activity_events for insert to authenticated
with check (user_id = (select auth.uid()));

revoke all on all tables in schema public from anon;
grant select, update on public.profiles to authenticated;
grant select on public.courses, public.lessons, public.vocabulary, public.vocabulary_examples, public.grammar_points, public.dialogues, public.dialogue_lines, public.media_assets, public.exercises to authenticated;
grant insert, update, delete on public.courses, public.lessons, public.vocabulary, public.vocabulary_examples, public.grammar_points, public.dialogues, public.dialogue_lines, public.media_assets, public.exercises to authenticated;
grant select, insert, update, delete on public.user_vocabulary_progress, public.user_lesson_progress, public.writing_drafts, public.content_reports to authenticated;
grant select, insert on public.assessment_attempts, public.activity_events to authenticated;
grant select, insert, update, delete on public.shadowing_submissions, public.writing_submissions to authenticated;
grant select, insert, update on public.notifications to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-media', 'course-media', false, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/ogg', 'image/jpeg', 'image/png', 'image/webp']),
  ('shadowing-submissions', 'shadowing-submissions', false, 15728640, array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg']),
  ('report-images', 'report-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy course_media_authenticated_read on storage.objects for select to authenticated
using (bucket_id = 'course-media');
create policy course_media_staff_insert on storage.objects for insert to authenticated
with check (bucket_id = 'course-media' and private.is_admin());
create policy course_media_staff_update on storage.objects for update to authenticated
using (bucket_id = 'course-media' and private.is_admin())
with check (bucket_id = 'course-media' and private.is_admin());
create policy course_media_staff_delete on storage.objects for delete to authenticated
using (bucket_id = 'course-media' and private.is_admin());

create policy shadowing_own_read on storage.objects for select to authenticated
using (
  bucket_id = 'shadowing-submissions'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_staff())
);
create policy shadowing_own_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'shadowing-submissions'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy shadowing_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'shadowing-submissions' and private.is_admin());

create policy report_images_read on storage.objects for select to authenticated
using (
  bucket_id = 'report-images'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_staff())
);
create policy report_images_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'report-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy report_images_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'report-images'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin())
);
