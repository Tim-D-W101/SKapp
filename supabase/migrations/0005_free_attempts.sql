-- =============================================================================
-- 0005_free_attempts.sql
--
-- A daily allowance of free scan attempts.
--
-- By design, a rejected or failed scan keeps the free scan. Without a cap, one
-- account could keep sending unusable photos, or several at once, and every
-- one would cost a model call. The analyze-scan Edge Function now takes one
-- attempt from this allowance before each free analysis. A subscription
-- covers a scan once the allowance is used up.
--
--   1. Two server-only columns on profiles: the free attempts used in the
--      current window, and when that window began. The app can read them
--      (they're the user's own data, and part of the data download) but
--      can't change them: profiles grants update on named columns only.
--   2. take_free_attempt(), for the Edge Function. It's a single UPDATE, so
--      two overlapping calls can never both take the last attempt.
--
-- Idempotent: safe to run more than once in the Supabase SQL editor. Run it
-- before deploying the version of analyze-scan that calls take_free_attempt.
-- =============================================================================


-- ---- 1. Columns -------------------------------------------------------------

alter table public.profiles
  add column if not exists free_attempts int not null default 0
    check (free_attempts >= 0),
  add column if not exists free_attempts_since timestamptz;


-- ---- 2. take_free_attempt ---------------------------------------------------

-- Takes one attempt if any are left in the current window, and starts a new
-- window once the old one has run its course. Returns true when an attempt
-- was taken, false when none are left (or there's no profile row).
create or replace function public.take_free_attempt(
  p_user_id        uuid,
  p_limit          int,
  p_window_seconds int
)
returns boolean
language sql
set search_path = ''
as $$
  with taken as (
    update public.profiles
       set free_attempts = case
             when free_attempts_since is null
               or free_attempts_since <= now() - make_interval(secs => p_window_seconds)
             then 1
             else free_attempts + 1
           end,
           free_attempts_since = case
             when free_attempts_since is null
               or free_attempts_since <= now() - make_interval(secs => p_window_seconds)
             then now()
             else free_attempts_since
           end
     where id = p_user_id
       and (
         free_attempts_since is null
         or free_attempts_since <= now() - make_interval(secs => p_window_seconds)
         or free_attempts < p_limit
       )
    returning 1
  )
  select exists (select 1 from taken);
$$;

-- Server only: nobody else may spend or reset the allowance.
revoke execute on function public.take_free_attempt(uuid, int, int)
  from public, anon, authenticated;
grant execute on function public.take_free_attempt(uuid, int, int)
  to service_role;
