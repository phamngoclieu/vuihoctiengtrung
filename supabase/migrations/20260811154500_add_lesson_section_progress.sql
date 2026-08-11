create or replace function public.mark_lesson_section(p_lesson_id text, p_section text)
returns public.user_lesson_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_sections text[];
  progress_row public.user_lesson_progress;
begin
  if (select auth.uid()) is null then
    raise exception 'Bạn cần đăng nhập.' using errcode = '42501';
  end if;
  if p_section <> all (array['vocabulary', 'flashcards', 'grammar', 'dialogues', 'pronunciation', 'exercises', 'listening', 'shadowing', 'writing']) then
    raise exception 'Phần học không hợp lệ.' using errcode = '22023';
  end if;

  insert into public.user_lesson_progress (user_id, lesson_id, completed_sections, completion_percent, last_opened_at)
  values ((select auth.uid()), p_lesson_id, array[p_section], 11, now())
  on conflict (user_id, lesson_id) do nothing;

  select case
    when p_section = any (completed_sections) then completed_sections
    else array_append(completed_sections, p_section)
  end
  into next_sections
  from public.user_lesson_progress
  where user_id = (select auth.uid()) and lesson_id = p_lesson_id;

  update public.user_lesson_progress
  set completed_sections = next_sections,
      completion_percent = least(100, round(100.0 * cardinality(next_sections) / 9)::integer),
      last_opened_at = now()
  where user_id = (select auth.uid()) and lesson_id = p_lesson_id
  returning * into progress_row;

  return progress_row;
end;
$$;

revoke all on function public.mark_lesson_section(text, text) from public, anon;
grant execute on function public.mark_lesson_section(text, text) to authenticated;
