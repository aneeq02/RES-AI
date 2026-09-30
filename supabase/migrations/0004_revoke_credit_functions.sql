-- The credit functions are called only by the API server (as the database owner). Supabase
-- grants execute on new functions to anon/authenticated (and Postgres to PUBLIC), which would
-- let any signed-in client call them over PostgREST RPC to mint, spend or refund credits.

revoke execute on function public.credit_balance(uuid) from public, anon, authenticated;
revoke execute on function public.reserve_task_credits(uuid) from public, anon, authenticated;
revoke execute on function public.fail_task(uuid, text) from public, anon, authenticated;
revoke execute on function public.grant_period_credits(uuid, int, text) from public, anon, authenticated;
