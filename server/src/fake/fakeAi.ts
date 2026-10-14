import type Anthropic from "@anthropic-ai/sdk";
import type { ChatLlm } from "../chat/llm.js";
import type { DraftLlm } from "../profile/draft.js";
import type { TaskLlm } from "../runner/llm.js";

/**
 * Development-only stand-ins for the three Anthropic seams (chat, research tasks, website drafts).
 * They let the whole product run end to end (auth, billing, streaming, task progress, deliverables,
 * credits) without an API key or any spend. Replies are scripted, not generated: nothing here says
 * anything about how the real model behaves. Enabled only by FAKE_AI=true, never in production.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const usage = (output: number, searches = 0, fetches = 0) =>
  ({
    input_tokens: 1200,
    output_tokens: output,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
    server_tool_use: { web_search_requests: searches, web_fetch_requests: fetches },
  }) as never;

const message = (model: string, content: unknown[], stop_reason: string, u: unknown) =>
  ({ id: `msg_fake_${Date.now()}`, type: "message", role: "assistant", model, content, stop_reason, stop_sequence: null, usage: u }) as never;

function lastUserText(messages: Anthropic.MessageParam[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return "";
  if (typeof last.content === "string") return last.content;
  return last.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(" ");
}

const WANTS_TASK = /(analy[sz]|research|compet|compare|market|trend|investigate|look into|dig into)/i;

function pickKind(kinds: string[], text: string): string {
  const prefer = /compet/i.test(text) ? "competitor_analysis" : /(market|size|trend)/i.test(text) ? "market_analysis" : "quick_research";
  return kinds.includes(prefer) ? prefer : kinds[0];
}

export function fakeChatLlm(): ChatLlm {
  return {
    async stream(p, onText) {
      const text = lastUserText(p.messages);
      const tool = p.tools.find((t) => t.name === "start_task");
      const kinds = ((tool?.input_schema as { properties?: { kind?: { enum?: string[] } } })?.properties?.kind?.enum ?? []) as string[];
      const propose = Boolean(tool && kinds.length && WANTS_TASK.test(text));

      const reply = propose
        ? "[Test mode] That's worth a proper look. I've set up a research task below. Check the brief, edit it if you like, then press **Start**."
        : `[Test mode] You said: "${text.slice(0, 160)}".\n\nThis is a scripted reply, because the server is running without an AI key:\n\n- Streaming works.\n- Your message and this reply are saved to the thread.\n- Ask me to *research* or *analyze* something to see a task proposal.`;

      for (const word of reply.split(/(?<= )/)) {
        onText(word);
        await sleep(30);
      }
      const content: unknown[] = [{ type: "text", text: reply }];
      if (propose) {
        content.push({
          type: "tool_use",
          id: "toolu_fake_start_task",
          name: "start_task",
          input: { kind: pickKind(kinds, text), summary: text.slice(0, 200) || "Research request", details: "Created in test mode (no AI key)." },
        });
      }
      return message(p.model, content, propose ? "tool_use" : "end_turn", usage(120));
    },
  };
}

const REPORT = (summary: string) =>
  [
    `# ${summary.slice(0, 80)}`,
    "",
    "> **Test mode:** this report was produced by the scripted fake AI, not a model. The research steps and sources are placeholders.",
    "",
    "## Summary",
    "",
    "- Progress events streamed live while the task ran.",
    "- Credits were reserved when you pressed **Start** and are spent now that the report is saved.",
    "- The sources below are placeholders ([example.com](https://example.com)).",
    "",
    "## Comparison",
    "",
    "| Item | Finding | Confidence |",
    "| --- | --- | --- |",
    "| Pricing | Placeholder figure | Low |",
    "| Positioning | Placeholder summary | Low |",
    "",
    "## Where you can win",
    "",
    "Replace this with real research by running the server with a real `ANTHROPIC_API_KEY`.",
  ].join("\n");

/** Scripted three-turn research run: two searches, two page reads, then the saved report. */
export function fakeTaskLlm(opts: { stepDelayMs?: number } = {}): TaskLlm {
  const delay = opts.stepDelayMs ?? 1500;
  return {
    async run(turn, onBlock) {
      const assistantTurns = turn.messages.filter((m) => m.role === "assistant").length;
      const first = turn.messages[0]?.content;
      const brief = (typeof first === "string" ? first : "").match(/^Brief: (.*)$/m)?.[1] ?? "Research report";
      await sleep(delay);

      if (assistantTurns === 0) {
        const blocks = [
          { type: "server_tool_use", id: "srv_s1", name: "web_search", input: { query: `${brief} overview` } },
          { type: "server_tool_use", id: "srv_s2", name: "web_search", input: { query: `${brief} pricing and alternatives` } },
        ];
        blocks.forEach((b) => onBlock(b as never));
        return message(turn.model, [...blocks, { type: "tool_use", id: "tu_log1", name: "log_step", input: { text: "Searching for sources" } }], "tool_use", usage(300, 2, 0));
      }
      if (assistantTurns === 1) {
        const blocks = [
          { type: "server_tool_use", id: "srv_f1", name: "web_fetch", input: { url: "https://example.com/market-overview" } },
          { type: "server_tool_use", id: "srv_f2", name: "web_fetch", input: { url: "https://example.org/pricing-guide" } },
        ];
        blocks.forEach((b) => onBlock(b as never));
        return message(turn.model, [...blocks, { type: "tool_use", id: "tu_log2", name: "log_step", input: { text: "Comparing what the sources say" } }], "tool_use", usage(300, 0, 2));
      }
      return message(
        turn.model,
        [
          {
            type: "tool_use",
            id: "tu_save",
            name: "save_deliverable",
            input: {
              title: brief.slice(0, 120),
              body_md: REPORT(brief),
              sources: [
                { title: "Market overview (placeholder)", url: "https://example.com/market-overview" },
                { title: "Pricing guide (placeholder)", url: "https://example.org/pricing-guide" },
              ],
            },
          },
        ],
        "tool_use",
        usage(900),
      );
    },
  };
}

export function fakeDraftLlm(): DraftLlm {
  return {
    async create(params) {
      const text = JSON.stringify(params.messages[0]?.content ?? "");
      const host = text.match(/https?:\/\/(?:www\.)?([a-z0-9.-]+)/i)?.[1] ?? "example.com";
      const company = host.split(".")[0].replace(/^\w/, (c) => c.toUpperCase());
      return message(params.model, [
        {
          type: "tool_use",
          id: "toolu_fake_profile",
          name: "submit_profile",
          input: {
            company,
            industry: "Test-mode industry",
            audience: `People who would buy from ${company}. (Drafted in test mode, not read from the site.)`,
            competitors: ["Competitor A", "Competitor B"],
            brandVoice: "Friendly and plain-spoken. (Test-mode draft.)",
          },
        },
      ], "tool_use", usage(80));
    },
  };
}
