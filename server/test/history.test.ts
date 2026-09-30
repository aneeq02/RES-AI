import { describe, expect, it } from "vitest";
import { toApiMessages } from "../src/chat/history.js";

describe("toApiMessages", () => {
  it("renders task and deliverable blocks as text and drops leading assistant turns", () => {
    const tasks = new Map([["t1", { kind: "competitor_analysis", status: "done", brief: { summary: "Compare Asana" } }]]);
    const deliverables = new Map([["d1", { title: "Asana vs Notion", body_md: "x".repeat(5000) }]]);
    const out = toApiMessages(
      [
        { role: "assistant", content: [{ type: "text", text: "orphan" }] },
        { role: "user", content: [{ type: "text", text: "Compare us to Asana" }] },
        { role: "assistant", content: [{ type: "text", text: "On it." }, { type: "task", taskId: "t1" }] },
        { role: "assistant", content: [{ type: "deliverable", deliverableId: "d1" }] },
        { role: "assistant", content: [] },
      ],
      tasks,
      deliverables,
    );
    expect(out[0]).toEqual({ role: "user", content: "Compare us to Asana" });
    expect(out[1].content).toContain("[Proposed task competitor_analysis: Compare Asana (status: done)]");
    expect(out[2].content).toContain("[Delivered report: Asana vs Notion]");
    expect((out[2].content as string).length).toBeLessThan(2200);
    expect(out).toHaveLength(3);
  });
});
