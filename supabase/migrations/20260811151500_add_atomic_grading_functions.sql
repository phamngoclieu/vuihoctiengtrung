create or replace function public.grade_shadowing_submission(p_submission_id bigint, p_score numeric, p_comment text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if not private.is_staff() then
    raise exception 'Bạn không có quyền chấm bài.' using errcode = '42501';
  end if;
  if p_score < 0 or p_score > 10 or char_length(trim(coalesce(p_comment, ''))) = 0 then
    raise exception 'Điểm hoặc nhận xét chưa hợp lệ.' using errcode = '22023';
  end if;

  update public.shadowing_submissions
  set score = p_score,
      teacher_comment = trim(p_comment),
      graded_by = (select auth.uid()),
      graded_at = now()
  where id = p_submission_id
  returning user_id into target_user_id;

  if target_user_id is null then
    raise exception 'Không tìm thấy bài nộp.' using errcode = 'P0002';
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (target_user_id, 'grade', 'Bài shadowing đã được chấm', 'Bạn nhận được ' || p_score || '/10. Mở bài học để xem nhận xét của giáo viên.', '/app/lesson/1?v=shadowing');
end;
$$;

create or replace function public.grade_writing_submission(p_submission_id bigint, p_score numeric, p_comment text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  if not private.is_staff() then
    raise exception 'Bạn không có quyền chấm bài.' using errcode = '42501';
  end if;
  if p_score < 0 or p_score > 10 or char_length(trim(coalesce(p_comment, ''))) = 0 then
    raise exception 'Điểm hoặc nhận xét chưa hợp lệ.' using errcode = '22023';
  end if;

  update public.writing_submissions
  set score = p_score,
      teacher_comment = trim(p_comment),
      graded_by = (select auth.uid()),
      graded_at = now()
  where id = p_submission_id
  returning user_id into target_user_id;

  if target_user_id is null then
    raise exception 'Không tìm thấy bài nộp.' using errcode = 'P0002';
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  values (target_user_id, 'grade', 'Bài luyện viết đã được chấm', 'Bạn nhận được ' || p_score || '/10. Mở bài học để xem nhận xét của giáo viên.', '/app/lesson/1?v=writing');
end;
$$;

revoke all on function public.grade_shadowing_submission(bigint, numeric, text) from public, anon;
revoke all on function public.grade_writing_submission(bigint, numeric, text) from public, anon;
grant execute on function public.grade_shadowing_submission(bigint, numeric, text) to authenticated;
grant execute on function public.grade_writing_submission(bigint, numeric, text) to authenticated;
