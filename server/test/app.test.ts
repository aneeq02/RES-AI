import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { makeTestDb } from "./helpers/db.js";
import { createApp } from "../src/http/app.js";
import { grantPeriodCredits } from "../src/credits.js";

let t: Awaited<ReturnType<typeof makeTestDb>>;
let userId: string;
let otherId: string;
let enqueued: string[];
let app: ReturnType<typeof createApp>;

const chatLlm = {
  async stream(_p: any, onText: (d: string) => void) {
    onText("Let me research that.");
    return {
      content: [
        { type: "text", text: "Let me research that." },
        { type: "tool_use", id: "tu", name: "start_task", input: { kind: "quick_research", summary: "Asana pricing" } },
      ],
      stop_reason: "tool_use",
      usage: { input_tokens: 1, output_tokens: 1 },
    } as unknown as Anthropic.Message;
  },
};

beforeEach(async () => {
  t = await makeTestDb();
  userId = await t.createUser("ada@example.com");
  otherId = await t.createUser("eve@example.com");
  enqueued = [];
  app = createApp({
    db: t.db,
    verifyToken: async (token) => (token === "ada" ? { id: userId, email: "ada@example.com" } : token === "eve" ? { id: otherId, email: "eve@example.com" } : null),
    chatLlm,
    draftLlm: { create: async () => { throw new Error("unused"); } },
    stripe: {} as any,
    enqueueTask: async (id) => { enqueued.push(id); },
    appUrl: "http://localhost:5173",
    chatModel: "claude-sonnet-5",
    now: () => new Date("2026-09-02T00:00:00Z"),
  });
});
afterEach(async () => { await t.close(); });

const call = (method: string, path: string, token = "ada", body?: unknown) =>
  app.request(path, { method, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });

async function activate(credits = 10) {
  await t.db.query(
    `insert into subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, started_at)
     values ($1, 'cus', 'sub_ada', '1-month', 'active', '2026-09-01')`,
    [userId],
  );
  await grantPeriodCredits(t.db, userId, credits, "sub_ada:0");
}

async function proposeViaChat(): Promise<{ threadId: string; taskId: string }> {
  const thread = await (await call("POST", "/threads", "ada", { agentId: "buddy" })).json();
  const res = await call("POST", `/threads/${thread.thread.id}/messages`, "ada", { text: "What does Asana charge?" });
  const body = await res.text();
  const taskId = /event: task_proposed\ndata: (.*)\n/.exec(body)![1];
  return { threadId: thread.thread.id, taskId: JSON.parse(taskId).taskId };
}

describe("api", () => {
  it("rejects requests without a valid token", async () => {
    expect((await call("GET", "/me", "nope")).status).toBe(401);
  });

  it("lists live agents publicly", async () => {
    const res = await app.request("/agents");
    expect((await res.json()).agents.map((a: any) => a.id)).toEqual(["buddy"]);
  });

  it("returns /me and saves the business profile, marking onboarding complete", async () => {
    const before = await (await call("GET", "/me")).json();
    expect(before).toMatchObject({ user: { id: userId }, profile: { onboardedAt: null }, business: null, subscription: null, credits: null });
    const put = await call("PUT", "/profile", "ada", { name: "Ada", company: "Acme", competitors: ["Globex"] });
    expect(put.status).toBe(200);
    const after = await (await call("GET", "/me")).json();
    expect(after.profile.onboardedAt).not.toBeNull();
    expect(after.business).toMatchObject({ company: "Acme", competitors: ["Globex"], brandVoice: "" });
  });

  it("rejects a profile without a company name", async () => {
    expect((await call("PUT", "/profile", "ada", { company: "  " })).status).toBe(400);
  });

  it("reports credits and the reset date for an active plan", async () => {
    await activate(100);
    const me = await (await call("GET", "/me")).json();
    expect(me.credits).toEqual({ balance: 100, allowance: 100, resetsAt: "2026-10-01T00:00:00.000Z" });
  });

  it("blocks chat without an active plan", async () => {
    const thread = await (await call("POST", "/threads", "ada", { agentId: "buddy" })).json();
    const res = await call("POST", `/threads/${thread.thread.id}/messages`, "ada", { text: "hi" });
    expect(res.status).toBe(402);
  });

  it("refuses threads for agents that aren't live", async () => {
    expect((await call("POST", "/threads", "ada", { agentId: "soshie" })).status).toBe(404);
  });

  it("chats, proposes a task, starts it once, and enqueues it", async () => {
    await activate(10);
    const { threadId, taskId } = await proposeViaChat();
    const history = await (await call("GET", `/threads/${threadId}/messages`)).json();
    expect(history.tasks[taskId]).toMatchObject({ status: "proposed", credits: 1, label: "Quick research" });

    const start = await call("POST", `/tasks/${taskId}/start`, "ada", { brief: { summary: "Asana pricing 2026", details: "Business tier" } });
    expect(start.status).toBe(200);
    expect((await start.json()).task).toMatchObject({ status: "queued", brief: { summary: "Asana pricing 2026", details: "Business tier" } });
    expect(enqueued).toEqual([taskId]);

    const again = await call("POST", `/tasks/${taskId}/start`, "ada");
    expect(again.status).toBe(409);
    expect(enqueued).toHaveLength(1);
    expect((await (await call("GET", "/me")).json()).credits.balance).toBe(9);
  });

  it("returns 402 when credits are too low", async () => {
    await activate(0);
    const { taskId } = await proposeViaChat();
    const res = await call("POST", `/tasks/${taskId}/start`, "ada");
    expect(res.status).toBe(402);
    expect(await res.json()).toEqual({ error: "insufficient_credits" });
  });

  it("never exposes one user's data to another", async () => {
    await activate(10);
    const { threadId, taskId } = await proposeViaChat();
    expect((await call("GET", `/threads/${threadId}/messages`, "eve")).status).toBe(404);
    expect((await call("GET", `/tasks/${taskId}`, "eve")).status).toBe(404);
    expect((await call("POST", `/tasks/${taskId}/start`, "eve")).status).toBe(404);
  });

  it("retries a failed task as a new proposal in the same thread", async () => {
    await activate(10);
    const { taskId } = await proposeViaChat();
    await call("POST", `/tasks/${taskId}/start`, "ada");
    await t.db.query("select public.fail_task($1, 'boom')", [taskId]);
    const res = await call("POST", `/tasks/${taskId}/retry`, "ada");
    const { task } = await res.json();
    expect(task).toMatchObject({ status: "proposed", kind: "quick_research" });
    expect(task.id).not.toBe(taskId);
  });

  it("enforces the chat rate limit", async () => {
    await activate(10);
    const thread = await (await call("POST", "/threads", "ada", { agentId: "buddy" })).json();
    await t.db.query(
      `insert into messages (thread_id, user_id, role, content)
       select $1, $2, 'user', '[]'::jsonb from generate_series(1, 60)`,
      [thread.thread.id, userId],
    );
    expect((await call("POST", `/threads/${thread.thread.id}/messages`, "ada", { text: "hi" })).status).toBe(429);
  });
});
