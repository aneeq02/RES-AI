import { describe, expect, it } from "vitest";
import { draftProfileFromWebsite } from "../src/profile/draft.js";

describe("draftProfileFromWebsite", () => {
  it("returns the submitted profile after the model reads the site", async () => {
    const calls: any[] = [];
    const llm = {
      create: async (p: any) => {
        calls.push(p);
        return {
          stop_reason: "tool_use",
          content: [{ type: "tool_use", id: "t", name: "submit_profile", input: { company: "Acme", industry: "SaaS", audience: "Founders", competitors: ["Globex"], brandVoice: "Plain" } }],
        } as any;
      },
    };
    const draft = await draftProfileFromWebsite(llm, "claude-sonnet-5", "acme.test");
    expect(draft).toEqual({ company: "Acme", website: "https://acme.test", industry: "SaaS", audience: "Founders", competitors: ["Globex"], brandVoice: "Plain" });
    expect(JSON.stringify(calls[0].messages)).toContain("https://acme.test");
    expect(calls[0].tools.map((t: any) => t.name)).toEqual(["web_fetch", "submit_profile"]);
  });

  it("throws when the model never submits", async () => {
    const llm = { create: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: "no" }] }) as any };
    await expect(draftProfileFromWebsite(llm, "m", "acme.test")).rejects.toThrow(/couldn't read/i);
  });
});
