import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { buddy } from "../../src/agents/buddy.js";
import { anthropicTaskLlm } from "../../src/runner/llm.js";
import { runTask, type DeliverableInput } from "../../src/runner/runTask.js";

// Opt-in: skipped unless ANTHROPIC_API_KEY is set. Spends real API credits (roughly $0.05-$0.20).
describe.runIf(process.env.ANTHROPIC_API_KEY)("live quick_research", () => {
  it("produces a cited deliverable", async () => {
    const saved: DeliverableInput[] = [];
    const events: string[] = [];
    const out = await runTask(
      { id: "live", user_id: "u", agent_id: "buddy", thread_id: "t", kind: "quick_research", brief: { summary: "What does Notion's Plus plan cost per member per month?", details: "" }, attempts: 1 },
      {
        llm: anthropicTaskLlm(new Anthropic()),
        agent: buddy,
        model: process.env.TASK_MODEL ?? "claude-opus-5",
        io: {
          loadContext: async () => ({ business: null, earlier: [] }),
          addEvent: async (_t, type, text) => { events.push(`${type}: ${text}`); },
          complete: async (_t, d) => { saved.push(d); return "live-deliverable"; },
          isStillRunning: async () => true,
        },
      },
    );
    console.log(events.join("\n"), `\ncost $${out.costUsd.toFixed(3)}`);
    expect(saved[0].sources.length).toBeGreaterThan(0);
    expect(saved[0].body_md).toMatch(/https?:\/\//);
  });
});
