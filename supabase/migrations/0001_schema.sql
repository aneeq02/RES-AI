-- res app schema. The browser reads its own rows (RLS select policies); every write goes through the API server.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  stripe_customer_id text unique,
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.business_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  company text not null default '',
  website text not null default '',
  industry text not null default '',
  audience text not null default '',
  competitors text[] not null default '{}',
  brand_voice text not null default '',
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan_id text not null,
  status text not null,
  started_at timestamptz not null,
  current_period_end timestamptz
);

create table public.stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  agent_id text not null,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index threads_user_agent_idx on public.threads (user_id, agent_id, updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index messages_thread_idx on public.messages (thread_id, created_at);
create index messages_user_recent_idx on public.messages (user_id, role, created_at);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  agent_id text not null,
  thread_id uuid not null references public.threads (id) on delete cascade,
  kind text not null,
  brief jsonb not null,
  status text not null default 'proposed'
    check (status in ('proposed', 'queued', 'running', 'done', 'failed', 'cancelled')),
  credits_charged int not null check (credits_charged >= 0),
  cost_usd numeric(10, 4) not null default 0,
  attempts int not null default 0,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);
create index tasks_user_idx on public.tasks (user_id, created_at desc);
create index tasks_running_idx on public.tasks (status, started_at) where status = 'running';

create table public.task_events (
  id bigserial primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('step', 'search', 'fetch', 'note')),
  text text not null,
  created_at timestamptz not null default now()
);
create index task_events_task_idx on public.task_events (task_id, id);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  agent_id text not null,
  title text not null,
  body_md text not null,
  sources jsonb not null default '[]'::jsonb,
  partial boolean not null default false,
  created_at timestamptz not null default now()
);
create index deliverables_user_idx on public.deliverables (user_id, created_at desc);

create table public.credit_ledger (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta int not null,
  reason text not null check (reason in ('grant', 'task', 'refund', 'expire')),
  task_id uuid references public.tasks (id) on delete set null,
  ref text unique,
  created_at timestamptz not null default now()
);
create index credit_ledger_user_idx on public.credit_ledger (user_id);

-- Row level security: users may read only their own rows. No insert/update/delete policies exist,
-- so only the service role (the API server) can write.
alter table public.profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;
alter table public.task_events enable row level security;
alter table public.deliverables enable row level security;
alter table public.credit_ledger enable row level security;

create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own business profile" on public.business_profiles for select to authenticated using (user_id = auth.uid());
create policy "own subscription" on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy "own threads" on public.threads for select to authenticated using (user_id = auth.uid());
create policy "own messages" on public.messages for select to authenticated using (user_id = auth.uid());
create policy "own tasks" on public.tasks for select to authenticated using (user_id = auth.uid());
create policy "own task events" on public.task_events for select to authenticated using (user_id = auth.uid());
create policy "own deliverables" on public.deliverables for select to authenticated using (user_id = auth.uid());
create policy "own credits" on public.credit_ledger for select to authenticated using (user_id = auth.uid());

alter publication supabase_realtime add table public.tasks, public.task_events, public.deliverables;
