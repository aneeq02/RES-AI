-- Credit ledger operations. Each is one statement for callers, runs in its own transaction,
-- and takes a per-user advisory lock so concurrent calls can't overdraw or double-grant.

create function public.credit_balance(p_user uuid) returns int
language sql stable as $$
  select coalesce(sum(delta), 0)::int from public.credit_ledger where user_id = p_user
$$;

create function public.reserve_task_credits(p_task uuid) returns text
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
  update public.tasks set status = 'queued' where id = t.id;
  return 'ok';
end $$;

create function public.fail_task(p_task uuid, p_error text) returns boolean
language plpgsql as $$
declare
  t public.tasks;
begin
  update public.tasks set status = 'failed', error = p_error, finished_at = now()
    where id = p_task and status in ('queued', 'running')
    returning * into t;
  if not found then return false; end if;
  insert into public.credit_ledger (user_id, delta, reason, task_id, ref)
    values (t.user_id, t.credits_charged, 'refund', t.id, 'refund:' || t.id)
    on conflict (ref) do nothing;
  return true;
end $$;

create function public.grant_period_credits(p_user uuid, p_amount int, p_ref text) returns boolean
language plpgsql as $$
declare
  bal int;
begin
  perform pg_advisory_xact_lock(hashtext(p_user::text));
  if exists (select 1 from public.credit_ledger where ref = 'grant:' || p_ref) then return false; end if;
  bal := public.credit_balance(p_user);
  if bal > 0 then
    insert into public.credit_ledger (user_id, delta, reason, ref) values (p_user, -bal, 'expire', 'expire:' || p_ref);
  end if;
  insert into public.credit_ledger (user_id, delta, reason, ref) values (p_user, p_amount, 'grant', 'grant:' || p_ref);
  return true;
end $$;
