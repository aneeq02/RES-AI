import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { makeTestDb } from "./helpers/db.js";
import { buddy } from "../src/agents/buddy.js";
import { sendChatMessage, type ChatEvent } from "../src/chat/chat.js";
import type { ChatLlm } from "../src/chat/llm.js";
import type { Db } from "../src/db.js";

let t: Awaited<ReturnType<typeof makeTestDb>>;
let userId: string;
let threadId: string;
beforeEach(async () => {
  t = await makeTestDb();
  userId = await t.createUser();
  threadId = (await t.db.query("insert into threads (user_id, agent_id) values ($1, 'buddy') returning id", [userId])).rows[0].id;
});
afterEach(async () => { await t.close(); });

function fakeLlm(deltas: string[], extraContent: any[] = []): ChatLlm & { calls: any[] } {
  const calls: any[] = [];
  return {
    calls,
    async stream(p, onText) {
      calls.push(p);
      for (const d of deltas) onText(d);
      return { content: [{ type: "text", text: deltas.join("") }, ...extraContent], stop_reason: extraContent.length ? "tool_use" : "end_turn", usage: { input_tokens: 1, output_tokens: 1 } } as unknown as Anthropic.Message;
    },
  };
}

const run = (llm: ChatLlm, text: string, emit: (e: ChatEvent) => void = () => {}) =>
  sendChatMessage({ db: t.db, llm, model: "claude-sonnet-5" }, { userId, threadId, agent: buddy, text, emit });

const messages = async () => (await t.db.query("select role, content from messages where thread_id = $1 order by created_at", [threadId])).rows;

describe("sendChatMessage", () => {
  it("streams the reply, saves both messages and titles the thread", async () => {
    const events: ChatEvent[] = [];
    await run(fakeLlm(["Hel", "lo"]), "How should I price my SaaS?", (e) => { events.push(e); });
    expect(events.map((e) => e.event)).toEqual(["text", "text", "done"]);
    expect(await messages()).toEqual([
      { role: "user", content: [{ type: "text", text: "How should I price my SaaS?" }] },
      { role: "assistant", content: [{ type: "text", text: "Hello" }] },
    ]);
    const { rows } = await t.db.query("select title from threads where id = $1", [threadId]);
    expect(rows[0].title).toBe("How should I price my SaaS?");
  });

  it("creates a proposed task with the kind's credit cost when Buddy calls start_task", async () => {
    const events: ChatEvent[] = [];
    const llm = fakeLlm(["I'll compare you to Asana."], [
      { type: "tool_use", id: "tu1", name: "start_task", input: { kind: "competitor_analysis", summary: "Compare to Asana", details: "Pricing focus" } },
    ]);
    await run(llm, "Compare us to Asana", (e) => { events.push(e); });
    const proposed = events.find((e) => e.event === "task_proposed")!;
    const { rows } = await t.db.query("select kind, status, credits_charged, brief from tasks");
    expect(rows).toEqual([{ kind: "competitor_analysis", status: "proposed", credits_charged: 5, brief: { summary: "Compare to Asana", details: "Pricing focus" } }]);
    expect((await messages())[1].content).toEqual([
      { type: "text", text: "I'll compare you to Asana." },
      { type: "task", taskId: (proposed.data as any).taskId },
    ]);
  });

  it("ignores a start_task call with an unknown kind", async () => {
    await run(fakeLlm(["Sure."], [{ type: "tool_use", id: "tu1", name: "start_task", input: { kind: "hack_the_planet", summary: "x" } }]), "do it");
    expect((await t.db.query("select count(*)::int as n from tasks")).rows[0].n).toBe(0);
    expect(JSON.stringify((await messages())[1].content)).toContain("couldn't set that task up");
  });

  it("still saves the full reply when the client disconnects mid-stream", async () => {
    const emit = (e: ChatEvent) => { if (e.event === "text") throw new Error("client gone"); };
    await run(fakeLlm(["Part one. ", "Part two."]), "hi", emit);
    expect((await messages())[1].content).toEqual([{ type: "text", text: "Part one. Part two." }]);
  });

  it("sends history and the business profile to the model", async () => {
    await t.db.query("insert into business_profiles (user_id, company) values ($1, 'Acme')", [userId]);
    const llm = fakeLlm(["ok"]);
    await run(llm, "first");
    await run(llm, "second");
    expect(llm.calls[1].system).toContain("Acme");
    expect(llm.calls[1].messages.map((m: any) => m.role)).toEqual(["user", "assistant", "user"]);
  });

  it("does not let a slow in-flight autosave overwrite the final task block after the stream ends", async () => {
    // Force every delta to cross the autosave interval, and delay every text-only
    // autosave write (but not the final write, which includes the task block) so a
    // write started mid-stream is still in flight when the stream resolves.
    let clock = Date.now();
    const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => (clock += 2000));
    const slowDb: Db = {
      query: async (text: string, params?: unknown[]) => {
        const isTextOnlyAutosave =
          text.startsWith("update messages set content") && !String(params?.[1] ?? "").includes('"type":"task"');
        if (isTextOnlyAutosave) await new Promise((resolve) => setTimeout(resolve, 50));
        return t.db.query(text, params);
      },
    };

    try {
      const llm = fakeLlm(["I'll ", "compare ", "you to Asana."], [
        { type: "tool_use", id: "tu1", name: "start_task", input: { kind: "competitor_analysis", summary: "Compare to Asana" } },
      ]);
      await sendChatMessage(
        { db: slowDb, llm, model: "claude-sonnet-5" },
        { userId, threadId, agent: buddy, text: "Compare us to Asana", emit: () => {} },
      );
      // Let any still in-flight delayed autosave land before asserting the final state.
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect((await messages())[1].content).toContainEqual({ type: "task", taskId: expect.any(String) });
    } finally {
      nowSpy.mockRestore();
    }
  });
});
