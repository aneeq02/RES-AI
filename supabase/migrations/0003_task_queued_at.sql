-- Tracks when a task most recently entered the queue, so the sweeper can catch tasks that
-- never got claimed by a worker (stuck in 'queued'), not just tasks stuck in 'running'.

alter table public.tasks add column queued_at timestamptz;

create or replace function public.reserve_task_credits(p_task uuid) returns text
language plpgsql as $$
declare
  t public.tasks;
begin
  select * into t from public.tasks where id = p_task;
  if not found then return 'not_found'; end if;
  perform pg_advisory_xact_lock(hashtext(t.user_id::text));
  -- re-read under the lock: another caller may have started it
  select * into t from public.tasks where id = p_task;
  if t.status <> 'proposed' then return 'not_proposed'; end if;
  if public.credit_balance(t.user_id) < t.credits_charged then return 'insufficient'; end if;
  insert into public.credit_ledger (user_id, delta, reason, task_id, ref)
    values (t.user_id, -t.credits_charged, 'task', t.id, 'task:' || t.id);
  update public.tasks set status = 'queued', queued_at = now() where id = t.id;
  return 'ok';
end $$;
