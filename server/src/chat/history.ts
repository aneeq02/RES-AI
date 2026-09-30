import type Anthropic from "@anthropic-ai/sdk";

export type StoredBlock =
  | { type: "text"; text: string }
  | { type: "task"; taskId: string }
  | { type: "deliverable"; deliverableId: string };

const EXCERPT = 2000;

/** Stored blocks become plain text so the model never sees unpaired tool_use blocks. */
export function toApiMessages(
  rows: { role: "user" | "assistant"; content: StoredBlock[] }[],
  tasks: Map<string, { kind: string; status: string; brief: { summary: string } }>,
  deliverables: Map<string, { title: string; body_md: string }>,
): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = [];
  for (const row of rows) {
    const parts = row.content.map((b) => {
      if (b.type === "text") return b.text;
      if (b.type === "task") {
        const t = tasks.get(b.taskId);
        return t ? `[Proposed task ${t.kind}: ${t.brief.summary} (status: ${t.status})]` : "";
      }
      const d = deliverables.get(b.deliverableId);
      return d ? `[Delivered report: ${d.title}]\n${d.body_md.slice(0, EXCERPT)}` : "";
    });
    const text = parts.filter(Boolean).join("\n\n").trim();
    if (!text) continue;
    if (out.length === 0 && row.role === "assistant") continue; // the API requires a user turn first
    out.push({ role: row.role, content: text });
  }
  return out;
}
