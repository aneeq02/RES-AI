import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { makeTestDb } from "./helpers/db.js";
import { creditBalance, grantPeriodCredits, reserveTaskCredits } from "../src/credits.js";
import { isRetryable, processTaskJob } from "../src/worker.js";
import { sweepStaleTasks } from "../src/runner/repo.js";
import type { TaskLlm } from "../src/runner/llm.js";

let t: Awaited<ReturnType<typeof makeTestDb>>;
let userId: string;
let threadId: string;
let taskId: string;

beforeEach(async () => {
  t = await makeTestDb();
  userId = await t.createUser();
  threadId = (await t.db.query("insert into threads (user_id, agent_id) values ($1, 'buddy') returning id", [userId])).rows[0].id;
  await grantPeriodCredits(t.db, userId, 10, "g:0");
  taskId = (await t.db.query(
    `insert into tasks (user_id, agent_id, thread_id, kind, brief, credits_charged)
     values ($1, 'buddy', $2, 'quick_research', '{"summary":"Asana pricing","details":""}', 1) returning id`,
    [userId, threadId],
  )).rows[0].id;
  await reserveTaskCredits(t.db, taskId);
});
afterEach(async () => { await t.close(); });

const usage = { input_tokens: 100, output_tokens: 100, server_tool_use: { web_search_requests: 1, web_fetch_requests: 0 } };
const saving: TaskLlm = {
  run: async () => ({
    content: [{ type: "tool_use", id: "tu", name: "save_deliverable", input: { title: "Asana", body_md: "# Asana\n$10.99", sources: [{ title: "Asana", url: "https://asana.com/pricing" }] } }],
    stop_reason: "tool_use",
    usage,
  }) as any,
};
const failingWith = (err: Error): TaskLlm => ({ run: async () => { throw err; } });
const deps = (llm: TaskLlm) => ({ db: t.db, llm, model: "claude-opus-5" });
const task = async () => (await t.db.query("select * from tasks where id = $1", [taskId])).rows[0];

describe("processTaskJob", () => {
  it("runs the task, stores the deliverable, posts it to the thread and records cost", async () => {
    expect(await processTaskJob(deps(saving), taskId)).toBe("done");
    const row = await task();
    expect(row.status).toBe("done");
    expect(Number(row.cost_usd)).toBeGreaterThan(0);
    const d = (await t.db.query("select title, partial, sources from deliverables where task_id = $1", [taskId])).rows[0];
    expect(d).toEqual({ title: "Asana", partial: false, sources: [{ title: "Asana", url: "https://asana.com/pricing" }] });
    const m = (await t.db.query("select role, content from messages where thread_id = $1", [threadId])).rows;
    expect(m).toEqual([{ role: "assistant", content: [{ type: "deliverable", deliverableId: expect.any(String) }] }]);
  });

  it("skips a task that isn't queued (duplicate job delivery)", async () => {
    await processTaskJob(deps(saving), taskId);
    expect(await processTaskJob(deps(saving), taskId)).toBe("skipped");
  });

  it("requeues temporary API errors until the last attempt, then fails and refunds", async () => {
    const rateLimited = new Anthropic.RateLimitError(429, { error: { type: "rate_limit_error" } }, "slow down", new Headers());
    expect(await processTaskJob(deps(failingWith(rateLimited)), taskId)).toBe("retry");
    expect((await task()).status).toBe("queued");
    expect(await processTaskJob(deps(failingWith(rateLimited)), taskId)).toBe("retry");
    expect(await processTaskJob(deps(failingWith(rateLimited)), taskId)).toBe("failed");
    expect((await task()).status).toBe("failed");
    expect(await creditBalance(t.db, userId)).toBe(10);
  });

  it("fails and refunds immediately on non-retryable errors", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await processTaskJob(deps(failingWith(new Error("bug"))), taskId)).toBe("failed");
    const row = await task();
    expect(row.error).toBe("Something went wrong while Buddy was working. Your credits were refunded.");
    expect(await creditBalance(t.db, userId)).toBe(10);
    errSpy.mockRestore();
  });

  it("does not save an orphan deliverable if the sweeper already failed the task mid-run", async () => {
    const sweptMidRun: TaskLlm = {
      run: async () => {
        // Simulate the sweeper racing in and failing+refunding the task while this run is in flight.
        await t.db.query("select public.fail_task($1, 'swept')", [taskId]);
        return saving.run(undefined as any, undefined as any);
      },
    };
    expect(await processTaskJob(deps(sweptMidRun), taskId)).toBe("failed");
    const row = await task();
    expect(row.status).toBe("failed");
    // fail_task is a no-op once the task is already 'failed', so the original sweep error
    // ('swept') stays in place, unchanged and not duplicated with the TaskError's message.
    expect(row.error).toBe("swept");
    expect((await t.db.query("select 1 from deliverables where task_id = $1", [taskId])).rows).toHaveLength(0);
    expect((await t.db.query("select 1 from messages where thread_id = $1", [threadId])).rows).toHaveLength(0);
    expect(await creditBalance(t.db, userId)).toBe(10);
  });
});

describe("processTaskJob cancellation", () => {
  it("stops calling the model once the task has been failed by someone else", async () => {
    let calls = 0;
    const llm: TaskLlm = {
      run: async () => {
        calls++;
        await t.db.query("select public.fail_task($1, 'swept')", [taskId]);
        return { content: [{ type: "tool_use", id: "tu", name: "log_step", input: { text: "Searching" } }], stop_reason: "tool_use", usage } as any;
      },
    };
    expect(await processTaskJob(deps(llm), taskId)).toBe("failed");
    expect(calls).toBe(1);
    expect((await task()).error).toBe("swept");
    expect(await creditBalance(t.db, userId)).toBe(10);
  });
});

describe("isRetryable", () => {
  it("retries rate limits, server errors and connection errors only", () => {
    expect(isRetryable(new Anthropic.InternalServerError(500, undefined, "x", new Headers()))).toBe(true);
    expect(isRetryable(new Anthropic.APIConnectionError({ message: "reset" }))).toBe(true);
    expect(isRetryable(new Anthropic.BadRequestError(400, undefined, "x", new Headers()))).toBe(false);
    expect(isRetryable(new Error("x"))).toBe(false);
  });

  it("retries transient errors that arrive mid-stream (no HTTP status, only an error type)", () => {
    // Mirrors how the SDK's SSE decoder builds an `event: error` payload.
    const midStream = (type: "overloaded_error" | "api_error" | "rate_limit_error" | "invalid_request_error") =>
      new Anthropic.APIError(undefined, { type: "error", error: { type, message: "x" } }, undefined, new Headers(), type);
    expect(midStream("overloaded_error").status).toBeUndefined();
    expect(isRetryable(midStream("overloaded_error"))).toBe(true);
    expect(isRetryable(midStream("api_error"))).toBe(true);
    expect(isRetryable(midStream("rate_limit_error"))).toBe(true);
    expect(isRetryable(midStream("invalid_request_error"))).toBe(false);
  });
});

describe("sweepStaleTasks", () => {
  it("fails and refunds tasks stuck in running", async () => {
    await t.db.query("update tasks set status = 'running', started_at = now() - interval '20 minutes' where id = $1", [taskId]);
    expect(await sweepStaleTasks(t.db, 16)).toEqual([taskId]);
    expect((await task()).status).toBe("failed");
    expect(await creditBalance(t.db, userId)).toBe(10);
  });

  it("leaves recent running tasks alone", async () => {
    await t.db.query("update tasks set status = 'running', started_at = now() where id = $1", [taskId]);
    expect(await sweepStaleTasks(t.db, 16)).toEqual([]);
  });

  it("fails and refunds tasks stuck in queued for over two hours by default", async () => {
    await t.db.query("update tasks set queued_at = now() - interval '130 minutes' where id = $1", [taskId]);
    expect(await sweepStaleTasks(t.db, 16)).toEqual([taskId]);
    const row = await task();
    expect(row.status).toBe("failed");
    expect(row.error).toBe("Buddy couldn't get started. Your credits were refunded.");
    expect(await creditBalance(t.db, userId)).toBe(10);
  });

  it("leaves freshly queued tasks alone", async () => {
    expect(await sweepStaleTasks(t.db, 16)).toEqual([]);
    expect((await task()).status).toBe("queued");
  });

  it("leaves tasks queued behind ordinary load (under two hours) alone by default", async () => {
    await t.db.query("update tasks set queued_at = now() - interval '45 minutes' where id = $1", [taskId]);
    expect(await sweepStaleTasks(t.db, 16)).toEqual([]);
    expect((await task()).status).toBe("queued");
  });

  it("honours an explicit queued threshold", async () => {
    await t.db.query("update tasks set queued_at = now() - interval '40 minutes' where id = $1", [taskId]);
    expect(await sweepStaleTasks(t.db, 16, 30)).toEqual([taskId]);
  });
});

describe("reserveTaskCredits", () => {
  it("sets queued_at when it moves the task to queued", async () => {
    expect((await task()).queued_at).not.toBeNull();
  });
});
