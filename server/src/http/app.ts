import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import type Stripe from "stripe";
import type { Db } from "../db.js";
import { agentDto, getAgent, liveAgents } from "../agents/registry.js";
import { creditBalance, failTask, reserveTaskCredits } from "../credits.js";
import { creditPeriod } from "../period.js";
import { PLANS, isPlanId } from "../plans.js";
import { sendChatMessage } from "../chat/chat.js";
import type { ChatLlm } from "../chat/llm.js";
import { CHAT_RATE_LIMIT, countRecentUserMessages, createProposedTask, insertMessage } from "../chat/store.js";
import { draftProfileFromWebsite, normalizeWebsite, type DraftLlm } from "../profile/draft.js";
import {
  createCheckoutSession, createPortalSession, getSubscription, handleStripeEvent, isActive, syncCheckoutSession, type StripeLike,
} from "../billing/billing.js";
import { requireAuth, type AuthUser, type HonoEnv } from "./auth.js";
import { businessDto, deliverableSummary, iso, taskDto } from "./dto.js";

export interface AppDeps {
  db: Db;
  verifyToken(token: string): Promise<AuthUser | null>;
  chatLlm: ChatLlm;
  draftLlm: DraftLlm;
  stripe: StripeLike;
  enqueueTask(taskId: string): Promise<void>;
  appUrl: string;
  chatModel: string;
  webhookSecret?: string;
  now?: () => Date;
}

const ProfileBody = z.object({
  name: z.string().trim().max(100).optional().default(""),
  company: z.string().trim().min(1, "Company name is required").max(200),
  website: z.string().trim().max(300).optional().default(""),
  industry: z.string().trim().max(200).optional().default(""),
  audience: z.string().trim().max(1000).optional().default(""),
  competitors: z.array(z.string().trim().min(1).max(200)).max(20).optional().default([]),
  brandVoice: z.string().trim().max(2000).optional().default(""),
});
const BriefBody = z.object({ summary: z.string().trim().min(1).max(500), details: z.string().trim().max(4000).default("") });

const TASK_SELECT = `select t.*, d.id as deliverable_id from tasks t left join deliverables d on d.task_id = t.id`;
const DRAFT_LIMIT = 5;

export function createApp(deps: AppDeps) {
  const { db } = deps;
  const now = deps.now ?? (() => new Date());
  const draftUses = new Map<string, number[]>();
  const app = new Hono<HonoEnv>();

  app.use("*", cors({ origin: deps.appUrl, allowHeaders: ["authorization", "content-type"], allowMethods: ["GET", "POST", "PUT"] }));

  app.get("/health", (c) => c.json({ ok: true }));
  app.get("/agents", (c) => c.json({ agents: liveAgents().map(agentDto) }));

  app.post("/stripe/webhook", async (c) => {
    if (!deps.webhookSecret) return c.json({ error: "webhooks not configured" }, 404);
    let event: Stripe.Event;
    try {
      event = deps.stripe.webhooks.constructEvent(await c.req.text(), c.req.header("stripe-signature") ?? "", deps.webhookSecret);
    } catch {
      return c.json({ error: "bad signature" }, 400);
    }
    return c.json({ result: await handleStripeEvent(db, deps.stripe, event) });
  });

  const authed = new Hono<HonoEnv>();
  authed.use("*", requireAuth(deps.verifyToken));

  const requirePlan = async (userId: string) => isActive(await getSubscription(db, userId));
  const ownThread = async (userId: string, id: string) =>
    (await db.query("select * from threads where id = $1 and user_id = $2", [id, userId])).rows[0] ?? null;
  const ownTask = async (userId: string, id: string) =>
    (await db.query(`${TASK_SELECT} where t.id = $1 and t.user_id = $2`, [id, userId])).rows[0] ?? null;
  const validId = (id: string) => z.uuid().safeParse(id).success;

  authed.get("/me", async (c) => {
    const user = c.get("user");
    await db.query("insert into profiles (id) values ($1) on conflict do nothing", [user.id]);
    const profile = (await db.query("select name, onboarded_at from profiles where id = $1", [user.id])).rows[0];
    const business = (await db.query("select * from business_profiles where user_id = $1", [user.id])).rows[0];
    const sub = await getSubscription(db, user.id);
    const credits = isActive(sub)
      ? {
          balance: await creditBalance(db, user.id),
          allowance: PLANS[sub.plan_id].credits,
          resetsAt: creditPeriod(new Date(sub.started_at), now()).end.toISOString(),
        }
      : null;
    return c.json({
      user,
      profile: { name: profile.name, onboardedAt: iso(profile.onboarded_at) },
      business: businessDto(business),
      subscription: sub ? { planId: sub.plan_id, status: sub.status, currentPeriodEnd: iso(sub.current_period_end) } : null,
      credits,
      agents: liveAgents().map(agentDto),
    });
  });

  authed.put("/profile", async (c) => {
    const parsed = ProfileBody.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "invalid", issues: parsed.error.issues }, 400);
    const p = parsed.data;
    const user = c.get("user");
    await db.query(
      `insert into business_profiles (user_id, company, website, industry, audience, competitors, brand_voice, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, now())
       on conflict (user_id) do update set company = excluded.company, website = excluded.website, industry = excluded.industry,
         audience = excluded.audience, competitors = excluded.competitors, brand_voice = excluded.brand_voice, updated_at = now()`,
      [user.id, p.company, normalizeWebsite(p.website), p.industry, p.audience, p.competitors, p.brandVoice],
    );
    await db.query("update profiles set name = coalesce(nullif($2, ''), name), onboarded_at = coalesce(onboarded_at, now()) where id = $1", [user.id, p.name]);
    return c.json({ ok: true });
  });

  authed.post("/profile/draft-from-website", async (c) => {
    const user = c.get("user");
    const body = z.object({ website: z.string().trim().min(3).max(300) }).safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid" }, 400);
    const recent = (draftUses.get(user.id) ?? []).filter((ts) => ts > Date.now() - 3_600_000);
    if (recent.length >= DRAFT_LIMIT) return c.json({ error: "rate_limited" }, 429);
    draftUses.set(user.id, [...recent, Date.now()]);
    try {
      return c.json({ draft: await draftProfileFromWebsite(deps.draftLlm, deps.chatModel, body.data.website) });
    } catch (err) {
      console.error("profile draft failed", err);
      return c.json({ error: "Buddy couldn't read that website. Fill the profile in by hand." }, 422);
    }
  });

  authed.get("/threads", async (c) => {
    const { rows } = await db.query(
      "select id, title, updated_at from threads where user_id = $1 and agent_id = $2 order by updated_at desc limit 100",
      [c.get("user").id, c.req.query("agent") ?? ""],
    );
    return c.json({ threads: rows.map((r) => ({ id: r.id, title: r.title, updatedAt: iso(r.updated_at) })) });
  });

  authed.post("/threads", async (c) => {
    const body = z.object({ agentId: z.string() }).safeParse(await c.req.json().catch(() => null));
    if (!body.success || !getAgent(body.data.agentId)) return c.json({ error: "unknown_agent" }, 404);
    const { rows } = await db.query("insert into threads (user_id, agent_id) values ($1, $2) returning id, title, updated_at", [c.get("user").id, body.data.agentId]);
    return c.json({ thread: { id: rows[0].id, title: rows[0].title, updatedAt: iso(rows[0].updated_at) } });
  });

  authed.get("/threads/:id/messages", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    if (!validId(id) || !(await ownThread(user.id, id))) return c.json({ error: "not_found" }, 404);
    const messages = (await db.query("select id, role, content, created_at from messages where thread_id = $1 order by created_at", [id])).rows;
    const tasks = (await db.query(`${TASK_SELECT} where t.thread_id = $1`, [id])).rows;
    const deliverables = (await db.query("select * from deliverables where task_id = any($1::uuid[])", [tasks.map((t) => t.id)])).rows;
    return c.json({
      messages: messages.map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: iso(m.created_at) })),
      tasks: Object.fromEntries(tasks.map((t) => [t.id, taskDto(t)])),
      deliverables: Object.fromEntries(deliverables.map((d) => [d.id, deliverableSummary(d)])),
    });
  });

  authed.post("/threads/:id/messages", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const thread = validId(id) ? await ownThread(user.id, id) : null;
    const agent = thread && getAgent(thread.agent_id);
    if (!thread || !agent) return c.json({ error: "not_found" }, 404);
    const body = z.object({ text: z.string().trim().min(1).max(4000) }).safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid" }, 400);
    if (!(await requirePlan(user.id))) return c.json({ error: "no_plan" }, 402);
    if ((await countRecentUserMessages(db, user.id)) >= CHAT_RATE_LIMIT) return c.json({ error: "rate_limited" }, 429);

    return streamSSE(c, async (stream) => {
      await sendChatMessage(
        { db, llm: deps.chatLlm, model: deps.chatModel },
        { userId: user.id, threadId: id, agent, text: body.data.text, emit: (e) => stream.writeSSE({ event: e.event, data: JSON.stringify(e.data) }) },
      );
    });
  });

  authed.get("/tasks/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const task = validId(id) ? await ownTask(user.id, id) : null;
    if (!task) return c.json({ error: "not_found" }, 404);
    const events = (await db.query("select id, type, text, created_at from task_events where task_id = $1 order by id", [id])).rows;
    const d = task.deliverable_id ? (await db.query("select * from deliverables where id = $1", [task.deliverable_id])).rows[0] : null;
    return c.json({
      task: taskDto(task),
      events: events.map((e) => ({ id: Number(e.id), type: e.type, text: e.text, createdAt: iso(e.created_at) })),
      deliverable: d ? deliverableSummary(d) : null,
    });
  });

  authed.post("/tasks/:id/start", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const task = validId(id) ? await ownTask(user.id, id) : null;
    if (!task) return c.json({ error: "not_found" }, 404);
    if (!(await requirePlan(user.id))) return c.json({ error: "no_plan" }, 402);
    const raw = await c.req.json().catch(() => ({}));
    if (raw?.brief) {
      const brief = BriefBody.safeParse(raw.brief);
      if (!brief.success) return c.json({ error: "invalid_brief" }, 400);
      await db.query("update tasks set brief = $2::jsonb where id = $1 and status = 'proposed'", [id, JSON.stringify(brief.data)]);
    }
    const result = await reserveTaskCredits(db, id);
    if (result === "insufficient") return c.json({ error: "insufficient_credits" }, 402);
    if (result !== "ok") return c.json({ error: "not_proposed" }, 409);
    try {
      await deps.enqueueTask(id);
    } catch (err) {
      // Credits are already reserved; hand them back rather than leave the task stuck in 'queued'.
      console.error(`enqueue failed for task ${id}`, err);
      await failTask(db, id, "Buddy couldn't queue this task. Your credits were refunded.");
      return c.json({ error: "enqueue_failed" }, 503);
    }
    return c.json({ task: taskDto(await ownTask(user.id, id)) });
  });

  authed.post("/tasks/:id/retry", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const task = validId(id) ? await ownTask(user.id, id) : null;
    if (!task || task.status !== "failed") return c.json({ error: "not_found" }, 404);
    const newId = await createProposedTask(db, {
      userId: user.id, agentId: task.agent_id, threadId: task.thread_id, kind: task.kind,
      summary: task.brief.summary, details: task.brief.details ?? "", credits: task.credits_charged,
    });
    await insertMessage(db, task.thread_id, user.id, "assistant", [{ type: "text", text: "Here it is again. Start it when you're ready." }, { type: "task", taskId: newId }]);
    return c.json({ task: taskDto(await ownTask(user.id, newId)) });
  });

  authed.get("/deliverables", async (c) => {
    const agent = c.req.query("agent");
    const { rows } = await db.query(
      `select id, agent_id, title, partial, created_at, task_id from deliverables
       where user_id = $1 and ($2::text is null or agent_id = $2) order by created_at desc limit 200`,
      [c.get("user").id, agent ?? null],
    );
    return c.json({ deliverables: rows.map(deliverableSummary) });
  });

  authed.get("/deliverables/:id", async (c) => {
    const id = c.req.param("id");
    const { rows } = validId(id)
      ? await db.query("select d.*, t.thread_id from deliverables d join tasks t on t.id = d.task_id where d.id = $1 and d.user_id = $2", [id, c.get("user").id])
      : { rows: [] as any[] };
    const d = rows[0];
    if (!d) return c.json({ error: "not_found" }, 404);
    return c.json({ deliverable: { ...deliverableSummary(d), bodyMd: d.body_md, sources: d.sources, threadId: d.thread_id } });
  });

  authed.post("/billing/checkout", async (c) => {
    const user = c.get("user");
    const body = await c.req.json().catch(() => null);
    if (!isPlanId(body?.planId)) return c.json({ error: "invalid_plan" }, 400);
    if (await requirePlan(user.id)) return c.json({ error: "already_subscribed" }, 409);
    return c.json({ url: await createCheckoutSession(db, deps.stripe, { userId: user.id, email: user.email, planId: body.planId, appUrl: deps.appUrl }) });
  });

  authed.post("/billing/sync", async (c) => {
    const body = z.object({ sessionId: z.string().min(1) }).safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: "invalid" }, 400);
    return c.json({ ok: await syncCheckoutSession(db, deps.stripe, c.get("user").id, body.data.sessionId) });
  });

  authed.post("/billing/portal", async (c) => {
    const url = await createPortalSession(db, deps.stripe, c.get("user").id, deps.appUrl);
    return url ? c.json({ url }) : c.json({ error: "no_customer" }, 404);
  });

  app.route("/", authed);
  return app;
}
