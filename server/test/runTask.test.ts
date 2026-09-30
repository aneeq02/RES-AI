import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { buddy } from "../src/agents/buddy.js";
import { costUsd } from "../src/pricing.js";
import { runTask, TaskError, WALL_CLOCK_BUDGET_MS, type DeliverableInput, type RunnerIO, type TaskRow } from "../src/runner/runTask.js";
import type { TaskLlm, TaskTurn } from "../src/runner/llm.js";

type Msg = Anthropic.Beta.BetaMessage;
const usage = (o = 1000, searches = 0) =>
  ({ input_tokens: 1000, output_tokens: o, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, server_tool_use: { web_search_requests: searches, web_fetch_requests: 0 } }) as any;
const msg = (content: any[], stop_reason: string, u = usage()): Msg => ({ id: "m", type: "message", role: "assistant", model: "claude-opus-5", content, stop_reason, stop_sequence: null, usage: u }) as any;
const toolUse = (name: string, input: unknown, id = `tu_${name}`) => ({ type: "tool_use", id, name, input });
const goodDeliverable = { title: "Competitors", body_md: "# Report\n[Asana](https://asana.com)", sources: [{ title: "Asana", url: "https://asana.com/pricing" }] };

function scripted(replies: Msg[], blocks: any[][] = []) {
  const turns: TaskTurn[] = [];
  const llm: TaskLlm = {
    async run(turn, onBlock) {
      turns.push(structuredClone(turn));
      (blocks[turns.length - 1] ?? []).forEach(onBlock);
      const next = replies[turns.length - 1];
      if (!next) throw new Error("no scripted reply");
      return next;
    },
  };
  return { llm, turns };
}

function memoryIO() {
  const events: [string, string][] = [];
  const saved: { d: DeliverableInput; cost: number }[] = [];
  const io: RunnerIO = {
    loadContext: async () => ({ business: null, earlier: [] }),
    addEvent: async (_t, type, text) => { events.push([type, text]); },
    complete: async (_t, d, cost) => { saved.push({ d, cost }); return "deliv_1"; },
    isStillRunning: async () => true,
  };
  return { io, events, saved };
}

const task: TaskRow = { id: "t1", user_id: "u1", agent_id: "buddy", thread_id: "th1", kind: "quick_research", brief: { summary: "Asana pricing", details: "" }, attempts: 1 };
const deps = (llm: TaskLlm, io: RunnerIO) => ({ llm, io, agent: buddy, model: "claude-opus-5" });

describe("runTask", () => {
  it("logs steps and web activity, then saves the deliverable", async () => {
    const { llm, turns } = scripted(
      [
        msg([toolUse("log_step", { text: "Searching pricing" })], "tool_use", usage(500, 2)),
        msg([toolUse("save_deliverable", goodDeliverable)], "tool_use"),
      ],
      [[{ type: "server_tool_use", id: "s1", name: "web_search", input: { query: "asana pricing" } }, { type: "server_tool_use", id: "s2", name: "web_fetch", input: { url: "https://asana.com/pricing" } }]],
    );
    const { io, events, saved } = memoryIO();
    const out = await runTask(task, deps(llm, io));
    expect(out.deliverableId).toBe("deliv_1");
    expect(events).toEqual([["search", "Searching: asana pricing"], ["fetch", "Reading https://asana.com/pricing"], ["step", "Searching pricing"]]);
    expect(saved[0].d).toEqual({ ...goodDeliverable, partial: false });
    expect(saved[0].cost).toBeGreaterThan(0.02); // two searches + tokens
    // web tools shrink as the search budget is spent
    const search = (turns[1].tools as any[]).find((t) => t.name === "web_search");
    expect(search.max_uses).toBe(3);
  });

  it("resumes a pause_turn without adding a user message", async () => {
    const { llm, turns } = scripted([
      msg([{ type: "text", text: "working" }], "pause_turn"),
      msg([toolUse("save_deliverable", goodDeliverable)], "tool_use"),
    ]);
    await runTask(task, deps(llm, memoryIO().io));
    expect(turns[1].messages.at(-1)!.role).toBe("assistant");
  });

  it("asks for a wrap-up and marks the report partial when the turn budget runs out", async () => {
    const loop = Array.from({ length: 8 }, () => msg([toolUse("log_step", { text: "more" })], "tool_use"));
    const { llm, turns } = scripted([...loop, msg([toolUse("save_deliverable", goodDeliverable)], "tool_use")]);
    const { io, saved } = memoryIO();
    await runTask(task, deps(llm, io));
    const last = turns.at(-1)!;
    expect(last.tools.map((t: any) => t.name)).toEqual(["save_deliverable"]);
    expect(JSON.stringify(last.messages.at(-1))).toMatch(/research budget/i);
    expect(saved[0].d.partial).toBe(true);
  });

  it("nudges once when the model stops without saving, then saves its text as a partial report", async () => {
    const { llm } = scripted([
      msg([{ type: "text", text: "Here is what I found about Asana." }], "end_turn"),
      msg([{ type: "text", text: "Asana costs $10.99 per user." }], "end_turn"),
    ]);
    const { io, saved } = memoryIO();
    await runTask(task, deps(llm, io));
    expect(saved[0].d).toMatchObject({ partial: true, title: "Asana pricing", body_md: "Asana costs $10.99 per user." });
  });

  it("returns a tool error for malformed save_deliverable input and accepts the retry", async () => {
    const { llm, turns } = scripted([
      msg([toolUse("save_deliverable", { title: "No body" })], "tool_use"),
      msg([toolUse("save_deliverable", goodDeliverable, "tu_2")], "tool_use"),
    ]);
    const { io, saved } = memoryIO();
    await runTask(task, deps(llm, io));
    const errorResult = (turns[1].messages.at(-1)!.content as any[])[0];
    expect(errorResult).toMatchObject({ type: "tool_result", is_error: true });
    expect(saved).toHaveLength(1);
  });

  it("fails with a TaskError when the model refuses", async () => {
    const { llm } = scripted([msg([], "refusal")]);
    await expect(runTask(task, deps(llm, memoryIO().io))).rejects.toBeInstanceOf(TaskError);
  });

  it("swallows a failing addEvent write for search/fetch progress events and still completes the run", async () => {
    const { llm } = scripted(
      [
        msg([toolUse("log_step", { text: "Searching pricing" })], "tool_use", usage(500, 2)),
        msg([toolUse("save_deliverable", goodDeliverable)], "tool_use"),
      ],
      [[{ type: "server_tool_use", id: "s1", name: "web_search", input: { query: "asana pricing" } }, { type: "server_tool_use", id: "s2", name: "web_fetch", input: { url: "https://asana.com/pricing" } }]],
    );
    const saved: { d: DeliverableInput; cost: number }[] = [];
    const io: RunnerIO = {
      loadContext: async () => ({ business: null, earlier: [] }),
      addEvent: async (_t, type) => {
        if (type === "search" || type === "fetch") throw new Error("db write failed");
      },
      complete: async (_t, d, cost) => { saved.push({ d, cost }); return "deliv_1"; },
      isStillRunning: async () => true,
    };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const out = await runTask(task, deps(llm, io));
      expect(out.deliverableId).toBe("deliv_1");
      expect(saved).toHaveLength(1);
      expect(errorSpy).toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("fails cleanly (never hangs) if the model will not save even after the wrap-up", async () => {
    const endless = Array.from({ length: 20 }, () => msg([toolUse("log_step", { text: "again" })], "tool_use"));
    const { llm } = scripted(endless);
    const meter = { usd: 0 };
    await expect(runTask(task, deps(llm, memoryIO().io), meter)).rejects.toBeInstanceOf(TaskError);
    expect(meter.usd).toBeGreaterThan(0);
  });
  it("wraps up with a partial report once the wall-clock budget has passed", async () => {
    let clock = 1_000_000;
    const { llm, turns } = scripted([
      msg([toolUse("log_step", { text: "Searching pricing" })], "tool_use"),
      msg([toolUse("save_deliverable", goodDeliverable)], "tool_use"),
    ]);
    const timed: TaskLlm = {
      async run(turn, onBlock) {
        const reply = await llm.run(turn, onBlock);
        clock += WALL_CLOCK_BUDGET_MS + 1; // the first turn alone blows the time budget
        return reply;
      },
    };
    const { io, saved } = memoryIO();
    await runTask(task, { ...deps(timed, io), now: () => clock });
    expect(turns).toHaveLength(2);
    expect(turns[0].tools.map((t: any) => t.name)).toContain("log_step");
    expect(turns[1].tools.map((t: any) => t.name)).toEqual(["save_deliverable"]);
    expect(JSON.stringify(turns[1].messages.at(-1))).toMatch(/research budget/i);
    expect(saved[0].d.partial).toBe(true);
  });

  it("stops without calling the model again once the task is no longer running", async () => {
    const { llm, turns } = scripted([
      msg([toolUse("log_step", { text: "Searching pricing" })], "tool_use"),
      msg([toolUse("save_deliverable", goodDeliverable)], "tool_use"),
    ]);
    const { io, saved } = memoryIO();
    const checks: string[] = [];
    io.isStillRunning = async (t) => { checks.push(t.id); return false; };
    await expect(runTask(task, deps(llm, io))).rejects.toThrow(new TaskError("Buddy stopped because the task was cancelled."));
    expect(turns).toHaveLength(1); // the first turn never checks; the second is never made
    expect(checks).toEqual(["t1"]);
    expect(saved).toHaveLength(0);
  });

  it("rejects non-http(s) source URLs with a tool error", async () => {
    const bad = { ...goodDeliverable, sources: [{ title: "x", url: "javascript:alert(1)" }] };
    const { llm, turns } = scripted([
      msg([toolUse("save_deliverable", bad)], "tool_use"),
      msg([toolUse("save_deliverable", goodDeliverable, "tu_2")], "tool_use"),
    ]);
    const { io, saved } = memoryIO();
    await runTask(task, deps(llm, io));
    const errorResult = (turns[1].messages.at(-1)!.content as any[])[0];
    expect(errorResult).toMatchObject({ type: "tool_result", is_error: true });
    expect(errorResult.content).toMatch(/sources\.0\.url/);
    expect(saved).toHaveLength(1);
    expect(saved[0].d.sources).toEqual(goodDeliverable.sources);
  });

  it("prices each turn by the model that served it", async () => {
    const u = usage(1000);
    const fallback = { ...msg([toolUse("save_deliverable", goodDeliverable)], "tool_use", u), model: "claude-sonnet-5" } as Msg;
    const { llm } = scripted([fallback]);
    const out = await runTask(task, deps(llm, memoryIO().io));
    expect(out.costUsd).toBeCloseTo(costUsd("claude-sonnet-5", u), 10);
    expect(out.costUsd).not.toBeCloseTo(costUsd("claude-opus-5", u), 10);
  });

  it("swallows a failing log_step event write", async () => {
    const { llm } = scripted([
      msg([toolUse("log_step", { text: "Searching pricing" })], "tool_use"),
      msg([toolUse("save_deliverable", goodDeliverable)], "tool_use"),
    ]);
    const { io, saved } = memoryIO();
    io.addEvent = async () => { throw new Error("db write failed"); };
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await runTask(task, deps(llm, io));
      expect(saved).toHaveLength(1);
      expect(errorSpy).toHaveBeenCalledWith("task event write failed", expect.any(Error));
    } finally {
      errorSpy.mockRestore();
    }
  });
});
