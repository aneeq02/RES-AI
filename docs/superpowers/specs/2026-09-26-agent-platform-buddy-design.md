# Agent platform + Buddy (milestone 1) — design

Date: 2026-09-26
Status: approved in conversation, pending written-spec review

## 1. Intent

**Goal.** Turn the res marketing site into a product where buying a plan gives you AI agents that do real work. Build it so it works for real now (portfolio/learning quality) and can grow into a paid product without a rewrite.

**What the user decided**
- Grow from a working project into a real product (production-shaped boundaries, no hardening yet).
- Agents become real **alphabetically**: Buddy → Cassie → Commet → Dexter → Emmie → Gigi → Milli → Penn → Scouty → Seomi → Soshie → Vizzy.
- Stack: **Supabase** (auth + Postgres) plus a **Node API server** with a Postgres-backed job queue.
- Billing: **one subscription unlocks the whole team**.
- Usage: **monthly task credits** per plan.
- Interaction: **chat + background tasks → saved deliverables**.

**Assumptions (accepted)**
- A shared business profile set during onboarding is the context every agent reads. It is what "Brand voice training" refers to.
- Stripe runs in test mode until launch.
- The developer's own Anthropic API key lives in `.env`.
- Marketing pages stay prerendered; the app lives under `/app` and is client-only.

**Success criteria for this milestone**
A new user can sign up, complete onboarding, check out with a Stripe test card, chat with Buddy, approve a competitor analysis, watch live progress, and receive a cited deliverable saved to their library. Credits are deducted, and refunded if the task fails.

## 2. Architecture

```
Browser (React 19 + Vite; marketing site + lazy-loaded /app)
   │  Supabase Auth (magic link + Google)
   │  Supabase Realtime ← task_events, tasks, deliverables
   ▼
Node API  (/server, TypeScript, Hono)
   ├─ REST: /me, /profile, /threads, /threads/:id/messages (SSE stream),
   │        /tasks, /tasks/:id/start, /deliverables, /billing/checkout,
   │        /billing/portal, /stripe/webhook
   ├─ Agent registry: server/src/agents/<id>.ts
   └─ Worker (same process for now; separable later): pg-boss consumers
          └─ Agent runner → Anthropic Messages API (+ web_search, web_fetch)
   ▼
Supabase Postgres (migrations in /supabase/migrations)
```

- The repo becomes a small monorepo: the existing site stays at the root, `/server` holds the API and worker, and `/supabase` holds migrations and config.
- The runtime uses the Anthropic SDK's tool-use loop directly (not the Agent SDK or Managed Agents), so credits, cost and data stay under our control. Later agents can call MCP servers from inside our own tools.
- Chat replies stream over SSE from the API. Research runs as a queued task on the worker and keeps going after the tab closes.

## 3. Data model

All tables have RLS enabled. Users can `select` only their own rows. All writes to `subscriptions`, `credit_ledger`, `tasks`, `task_events` and `deliverables` go through the server using the service role.

| Table | Columns |
|---|---|
| `profiles` | id (= auth.users.id), name, onboarded_at, created_at. Created by trigger on signup. |
| `business_profiles` | user_id PK, company, website, industry, audience, competitors text[], brand_voice, updated_at |
| `subscriptions` | user_id PK, stripe_customer_id, stripe_subscription_id, plan_id, status, current_period_end |
| `stripe_events` | event_id PK, processed_at (webhook idempotency) |
| `credit_ledger` | id, user_id, delta int, reason (`grant`\|`task`\|`refund`\|`expire`), task_id null, created_at. Append-only. |
| `threads` | id, user_id, agent_id, title, created_at, updated_at |
| `messages` | id, thread_id, user_id, role (`user`\|`assistant`), content jsonb (content blocks), created_at |
| `tasks` | id, user_id, agent_id, thread_id, kind, brief jsonb, status (`proposed`\|`queued`\|`running`\|`done`\|`failed`\|`cancelled`), credits_charged, cost_usd numeric, error text, created_at, started_at, finished_at |
| `task_events` | id, task_id, user_id, type (`step`\|`search`\|`fetch`\|`note`), text, created_at |
| `deliverables` | id, task_id, user_id, agent_id, title, body_md, sources jsonb, partial bool, created_at |

## 4. Credits

- **Allowance per plan** (placeholders, set in `src/data/plans.js` and shared with the server): 1-month plan 100, 3-month 150, 12-month 200.
- **Grant:** on Stripe `invoice.paid`, write an `expire` row that zeroes any remaining balance, then a `grant` row for the allowance. Credits do not roll over.
- **Chat is free**, rate limited to 60 user messages per hour per user.
- **Tasks cost credits** set by the agent config. Credits are reserved when a task moves from `proposed` to `queued`: one transaction takes a per-user advisory lock, checks balance ≥ cost, and inserts a `task` ledger row. On final failure, a `refund` row is inserted.
- `cost_usd` is computed from the token usage and search counts the API reports, and stored per task.
- **Per-task budget** (maximum turns, searches, fetches and output tokens) is defined per task kind. When it is reached, the runner tells the model to save a partial deliverable.

## 5. Agent registry and runner

An agent config (`server/src/agents/types.ts`):

```ts
interface AgentConfig {
  id: string;                 // matches src/data/members.js
  chatModel: string;          // e.g. Sonnet 5
  taskModel: string;          // e.g. Opus 5.5
  chatSystemPrompt(ctx): string;
  taskKinds: Record<string, {
    label: string; credits: number; etaMinutes: [number, number];
    budget: { maxTurns: number; maxSearches: number; maxFetches: number; maxOutputTokens: number };
    instructions: string;     // template for the deliverable
  }>;
  tools: ToolDef[];           // custom tools in addition to server tools
}
```

The registry exports only the agents that are live. The frontend reads the list from `GET /agents` to decide "Available" vs "Coming soon".

**Chat flow**
1. The user sends a message. The API loads the business profile and the last 30 messages, then streams a reply from `chatModel`, which has one tool: `start_task(kind, brief)`.
2. When the model calls `start_task`, the API creates a `tasks` row with status `proposed` and streams a confirmation card to the client: kind label, credits, ETA, brief, and **Start** / **Edit brief** buttons.
3. `POST /tasks/:id/start` reserves credits and enqueues a pg-boss job.

**Task runner (worker)**
- Tools: `web_search` and `web_fetch` (Anthropic server tools, with max uses set from the budget), `log_step(text)` which inserts a `task_events` row, and `save_deliverable(title, body_md, sources[])` which inserts a deliverable and ends the loop.
- The loop runs until `save_deliverable` is called, or the budget is used up (one final "save what you have" turn with `partial=true`), or an error occurs.
- Search and fetch results are also recorded as `task_events` so progress is visible.
- Page content from the web is treated as untrusted data by instruction. Buddy has no tools that act on the outside world.

**Buddy's task kinds**

| Kind | Credits | Budget (turns/searches/fetches) | Output |
|---|---|---|---|
| `quick_research` | 1 | 8 / 5 / 5 | Short sourced answer |
| `competitor_analysis` | 5 | 25 / 15 / 20 | Per-competitor positioning, pricing, features, strengths and weaknesses; comparison table; "where you can win" |
| `market_analysis` | 10 | 35 / 25 / 25 | Market signals, trends, segments, risks |
| `growth_plan` | 10 | 30 / 15 / 20 | 90-day plan: prioritized plays, channels, metrics; uses profile + past deliverables |

System prompt rules: cite a source URL for every factual claim, say plainly when data wasn't found instead of estimating silently, follow the profile's brand voice and audience, and use the deliverable template for the task kind.

**Onboarding helper:** `POST /profile/draft-from-website` (0 credits, small fixed budget) fetches the user's homepage and returns a draft business profile.

Model IDs, server-tool versions and pricing are confirmed against the current Claude API reference while planning.

## 6. Frontend

- **Routing:** marketing routes unchanged and prerendered. New routes: `/signup`, `/login`, `/auth/callback`, `/app`, `/app/onboarding`, `/app/agents/:id`, `/app/deliverables`, `/app/deliverables/:id`, `/app/settings`. `/app` is lazy-loaded, excluded from prerendering, and disallowed in `robots.txt`.
- **Purchase flow:** Get started → signup → onboarding (3 steps plus "Fill from my website") → `/checkout` (existing page becomes the plan summary) → Stripe Checkout → webhook → `/app`.
- **Team (`/app`):** 12 agent cards; live agents are "Available", the rest "Coming soon" with their rollout position. The header shows a credits meter.
- **Agent workspace:** thread list, streaming chat, task confirmation card, live progress panel (Realtime on `task_events`), inline deliverable cards.
- **Deliverables:** library filterable by agent; Markdown reader; copy and download `.md`.
- **Settings:** edit the business profile, plan, credits usage, Stripe Customer Portal link.
- **Guards:** no session → `/login`. Not onboarded → onboarding. No active subscription → Team page with a "Choose a plan" banner and chat disabled. Balance below the task cost → Start button disabled, showing "Out of credits · resets {date}".
- **Copy changes:** plan feature "Unlimited tasks & prompts" becomes "{N} task credits / month + unlimited chat". Remove per-agent `price` from `members.js`. "Hire X" becomes "Start with X".
- Uses the existing design system (`index.css` tokens, `btn-*`, `card`, `field`) and accessibility patterns.

## 7. Error handling

- pg-boss retries temporary errors (429, 5xx, network) twice with backoff. On final failure the task is marked `failed`, the error is stored, credits are refunded, and the UI shows a Retry option.
- Jobs expire after 15 minutes. On startup the worker marks tasks left `running` as failed (with a refund) or re-queues them.
- A budget that runs out produces a partial deliverable, not a failure.
- Stripe webhooks are signature-verified and idempotent through `stripe_events`.
- Assistant messages are saved as they stream, so reconnecting shows the full reply.
- Server-side validation (zod) on every request body. Agent and task-kind IDs are checked against the registry.

## 8. Testing

- **Vitest unit tests:** credit reserve/refund/expire, no negative balance under concurrent reserves, plan-to-allowance mapping, webhook idempotency.
- **Runner tests with a mocked Anthropic client:** tool loop to deliverable, budget cutoff to partial deliverable, error to refund.
- **Opt-in live test:** `npm run test:live` runs a real `quick_research` task.
- **Local Supabase** through the Supabase CLI. Migrations are checked in.
- **End-to-end browser check** of the full purchase-to-deliverable flow in the preview browser before the milestone is declared complete.

## 9. Out of scope (this milestone)

Agents Cassie→Vizzy (each gets its own spec on this foundation). Scheduled/recurring tasks. Teams/seats. PDF export. Admin dashboard. Email notifications. Production deployment. ruflo as a runtime dependency.

## 10. Setup the developer provides

Anthropic API key, a Supabase project (or Docker for local Supabase), and Stripe test-mode keys. The implementation adds `.env.example` and README setup steps.
