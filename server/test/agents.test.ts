import { describe, expect, it } from "vitest";
import { agentDto, getAgent, liveAgents } from "../src/agents/registry.js";

describe("agent registry", () => {
  it("has only Buddy live in milestone 1", () => {
    expect(liveAgents().map((a) => a.id)).toEqual(["buddy"]);
    expect(getAgent("soshie")).toBeUndefined();
  });

  it("defines Buddy's task kinds, credits and budgets from the spec", () => {
    const buddy = getAgent("buddy")!;
    const summary = Object.fromEntries(
      Object.entries(buddy.taskKinds).map(([k, v]) => [k, [v.credits, v.budget.maxTurns, v.budget.maxSearches, v.budget.maxFetches, v.budget.maxOutputTokens]]),
    );
    expect(summary).toEqual({
      quick_research: [1, 8, 5, 5, 20000],
      competitor_analysis: [5, 25, 15, 20, 80000],
      market_analysis: [10, 35, 25, 25, 100000],
      growth_plan: [10, 30, 15, 20, 80000],
    });
  });

  it("puts the business profile, citation rule and untrusted-web rule in the task prompt", () => {
    const buddy = getAgent("buddy")!;
    const prompt = buddy.taskSystemPrompt(
      { company: "Acme", website: "https://acme.test", industry: "SaaS", audience: "Founders", competitors: ["Globex"], brandVoice: "Plain" },
      "competitor_analysis",
    );
    expect(prompt).toContain("Acme");
    expect(prompt).toContain("Globex");
    expect(prompt).toMatch(/source URL/i);
    expect(prompt).toMatch(/untrusted/i);
    expect(prompt).toContain(buddy.taskKinds.competitor_analysis.instructions);
  });

  it("serialises kinds for the client", () => {
    expect(agentDto(getAgent("buddy")!).taskKinds[0]).toEqual({
      kind: "quick_research",
      label: "Quick research",
      description: expect.any(String),
      credits: 1,
      etaMinutes: [1, 2],
    });
  });
});
