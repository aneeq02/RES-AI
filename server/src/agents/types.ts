export interface BusinessProfile {
  company: string;
  website: string;
  industry: string;
  audience: string;
  competitors: string[];
  brandVoice: string;
}

export interface Brief {
  summary: string;
  details: string;
}

export interface TaskKind {
  label: string;
  description: string;
  credits: number;
  etaMinutes: [number, number];
  budget: { maxTurns: number; maxSearches: number; maxFetches: number; maxOutputTokens: number };
  instructions: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  taskKinds: Record<string, TaskKind>;
  chatSystemPrompt(business: BusinessProfile | null): string;
  taskSystemPrompt(business: BusinessProfile | null, kind: string): string;
  taskUserPrompt(brief: Brief, earlier: { title: string; excerpt: string }[]): string;
}

export function renderBusiness(b: BusinessProfile | null): string {
  if (!b) return "<business_profile>Not provided yet.</business_profile>";
  return [
    "<business_profile>",
    `Company: ${b.company || "unknown"}`,
    `Website: ${b.website || "unknown"}`,
    `Industry: ${b.industry || "unknown"}`,
    `Audience: ${b.audience || "unknown"}`,
    `Known competitors: ${b.competitors.length ? b.competitors.join(", ") : "none listed"}`,
    `Brand voice: ${b.brandVoice || "clear, friendly, professional"}`,
    "</business_profile>",
  ].join("\n");
}
