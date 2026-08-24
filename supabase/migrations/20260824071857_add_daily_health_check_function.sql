create or replace function public.daily_health_check()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select true;
$$;

revoke all on function public.daily_health_check() from public;
grant execute on function public.daily_health_check() to anon, authenticated;
