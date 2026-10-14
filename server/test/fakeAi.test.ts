import { describe, expect, it } from "vitest";
import { buddy } from "../src/agents/buddy.js";
import { loadEnv } from "../src/env.js";
import { fakeChatLlm, fakeDraftLlm, fakeTaskLlm } from "../src/fake/fakeAi.js";
import { runTask, type DeliverableInput, type RunnerIO, type TaskRow } from "../src/runner/runTask.js";

const base = {
  DATABASE_URL: "postgres://x",
  SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "k",
  STRIPE_SECRET_KEY: "sk_test_x",
};

describe("loadEnv with FAKE_AI", () => {
  it("requires an Anthropic key when fake mode is off", () => {
    expect(() => loadEnv({ ...base })).toThrow(/ANTHROPIC_API_KEY/);
    expect(() => loadEnv({ ...base, ANTHROPIC_API_KEY: "" })).toThrow(/ANTHROPIC_API_KEY/);
    expect(loadEnv({ ...base, ANTHROPIC_API_KEY: "sk-ant-x" }).FAKE_AI).toBe(false);
  });

  it("runs without a key when FAKE_AI=true", () => {
    const env = loadEnv({ ...base, ANTHROPIC_API_KEY: "", FAKE_AI: "true" });
    expect(env.FAKE_AI).toBe(true);
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("refuses fake mode in production", () => {
    expect(() => loadEnv({ ...base, FAKE_AI: "true", NODE_ENV: "production" })).toThrow(/production/);
  });
});

describe("fakeChatLlm", () => {
  const tools = [{ name: "start_task", description: "", input_schema: { type: "object", properties: { kind: { enum: Object.keys(buddy.taskKinds) } } } }] as never;
  const ask = async (text: string) => {
    let streamed = "";
    const msg = await fakeChatLlm().stream({ model: "m", system: "", messages: [{ role: "user", content: text }], tools }, (d) => (streamed += d));
    return { streamed, msg: msg as unknown as { content: { type: string; name?: string; input?: { kind: string; summary: string } }[] } };
  };

  it("streams a plain reply for a normal message", async () => {
    const { streamed, msg } = await ask("hello there");
    expect(streamed).toContain("hello there");
    expect(msg.content.some((b) => b.type === "tool_use")).toBe(false);
  });

  it("proposes a competitor analysis when asked to compare competitors", async () => {
    const { streamed, msg } = await ask("Compare us against our main competitors on pricing");
    const tu = msg.content.find((b) => b.type === "tool_use");
    expect(streamed).toContain("Start");
    expect(tu?.name).toBe("start_task");
    expect(tu?.input?.kind).toBe("competitor_analysis");
    expect(tu?.input?.summary).toContain("competitors");
  });
});

describe("fakeTaskLlm through the real runner", () => {
  it("logs search and fetch events, then saves a deliverable with http(s) sources", async () => {
    const events: [string, string][] = [];
    const saved: DeliverableInput[] = [];
    const io: RunnerIO = {
      loadContext: async () => ({ business: null, earlier: [] }),
      addEvent: async (_t, type, text) => { events.push([type, text]); },
      complete: async (_t, d) => { saved.push(d); return "deliv_1"; },
      isStillRunning: async () => true,
    };
    const task: TaskRow = { id: "t1", user_id: "u1", agent_id: "buddy", thread_id: "th1", kind: "quick_research", brief: { summary: "Cold-brew trends", details: "" }, attempts: 1 };

    const res = await runTask(task, { llm: fakeTaskLlm({ stepDelayMs: 0 }), io, agent: buddy, model: "claude-opus-5" });

    expect(res.deliverableId).toBe("deliv_1");
    await new Promise((r) => setTimeout(r, 10)); // progress events are fire-and-forget
    expect(events.filter(([t]) => t === "search")).toHaveLength(2);
    expect(events.filter(([t]) => t === "fetch")).toHaveLength(2);
    expect(events.filter(([t]) => t === "step").map(([, x]) => x)).toEqual(["Searching for sources", "Comparing what the sources say"]);
    expect(saved[0].title).toBe("Cold-brew trends");
    expect(saved[0].partial).toBe(false);
    expect(saved[0].sources.every((s) => /^https?:\/\//.test(s.url))).toBe(true);
    expect(res.costUsd).toBeGreaterThan(0);
  });
});

describe("fakeDraftLlm", () => {
  it("drafts a profile named after the site", async () => {
    const msg = await fakeDraftLlm().create({ model: "m", max_tokens: 1, messages: [{ role: "user", content: "Read https://www.northwind.coffee and call submit_profile" }] });
    const tu = msg.content.find((b) => b.type === "tool_use") as { name: string; input: { company: string } };
    expect(tu.name).toBe("submit_profile");
    expect(tu.input.company).toBe("Northwind");
  });
});
