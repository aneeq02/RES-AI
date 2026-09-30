import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestDb } from "./helpers/db.js";
import { creditBalance, failTask, grantPeriodCredits, reserveTaskCredits } from "../src/credits.js";

let t: Awaited<ReturnType<typeof makeTestDb>>;
let userId: string;
let threadId: string;

beforeEach(async () => {
  t = await makeTestDb();
  userId = await t.createUser();
  threadId = (await t.db.query("insert into threads (user_id, agent_id) values ($1, 'buddy') returning id", [userId])).rows[0].id;
});
afterEach(async () => { await t.close(); });

async function proposeTask(credits: number): Promise<string> {
  const { rows } = await t.db.query(
    `insert into tasks (user_id, agent_id, thread_id, kind, brief, credits_charged)
     values ($1, 'buddy', $2, 'competitor_analysis', '{"summary":"x","details":""}', $3) returning id`,
    [userId, threadId, credits],
  );
  return rows[0].id;
}

describe("credits", () => {
  it("grants, then expires unused credits at the next period instead of rolling over", async () => {
    expect(await grantPeriodCredits(t.db, userId, 100, "sub_1:0")).toBe(true);
    expect(await creditBalance(t.db, userId)).toBe(100);
    expect(await grantPeriodCredits(t.db, userId, 100, "sub_1:1")).toBe(true);
    expect(await creditBalance(t.db, userId)).toBe(100);
  });

  it("grants each period only once", async () => {
    await grantPeriodCredits(t.db, userId, 100, "sub_1:0");
    expect(await grantPeriodCredits(t.db, userId, 100, "sub_1:0")).toBe(false);
    expect(await creditBalance(t.db, userId)).toBe(100);
  });

  it("reserves credits and queues the task", async () => {
    await grantPeriodCredits(t.db, userId, 10, "g:0");
    const task = await proposeTask(5);
    expect(await reserveTaskCredits(t.db, task)).toBe("ok");
    expect(await creditBalance(t.db, userId)).toBe(5);
    const { rows } = await t.db.query("select status from tasks where id = $1", [task]);
    expect(rows[0].status).toBe("queued");
  });

  it("refuses when the balance is too low and leaves the task proposed", async () => {
    await grantPeriodCredits(t.db, userId, 4, "g:0");
    const task = await proposeTask(5);
    expect(await reserveTaskCredits(t.db, task)).toBe("insufficient");
    expect(await creditBalance(t.db, userId)).toBe(4);
  });

  it("charges once when the same task is started twice (double click / two tabs)", async () => {
    await grantPeriodCredits(t.db, userId, 10, "g:0");
    const task = await proposeTask(5);
    const results = await Promise.all([reserveTaskCredits(t.db, task), reserveTaskCredits(t.db, task)]);
    expect(results.sort()).toEqual(["not_proposed", "ok"]);
    expect(await creditBalance(t.db, userId)).toBe(5);
  });

  it("never goes negative when several tasks start at once", async () => {
    await grantPeriodCredits(t.db, userId, 10, "g:0");
    const tasks = await Promise.all([proposeTask(5), proposeTask(5), proposeTask(5)]);
    const results = await Promise.all(tasks.map((id) => reserveTaskCredits(t.db, id)));
    expect(results.filter((r) => r === "ok")).toHaveLength(2);
    expect(await creditBalance(t.db, userId)).toBe(0);
  });

  it("refunds a failed task exactly once", async () => {
    await grantPeriodCredits(t.db, userId, 10, "g:0");
    const task = await proposeTask(5);
    await reserveTaskCredits(t.db, task);
    expect(await failTask(t.db, task, "boom")).toBe(true);
    expect(await failTask(t.db, task, "boom again")).toBe(false);
    expect(await creditBalance(t.db, userId)).toBe(10);
    const { rows } = await t.db.query("select status, error from tasks where id = $1", [task]);
    expect(rows[0]).toEqual({ status: "failed", error: "boom" });
  });

  it("does not refund a task that never reserved credits", async () => {
    const task = await proposeTask(5);
    expect(await failTask(t.db, task, "x")).toBe(false);
    expect(await creditBalance(t.db, userId)).toBe(0);
  });

  it("returns not_found for an unknown task", async () => {
    expect(await reserveTaskCredits(t.db, "00000000-0000-0000-0000-000000000000")).toBe("not_found");
  });
});
