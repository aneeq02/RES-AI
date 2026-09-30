import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AgentConfig, Brief, BusinessProfile } from "../agents/types.js";
import { costUsd } from "../pricing.js";
import type { TaskLlm } from "./llm.js";

export interface TaskRow {
  id: string;
  user_id: string;
  agent_id: string;
  thread_id: string;
  kind: string;
  brief: Brief;
  attempts: number;
}

export interface DeliverableInput {
  title: string;
  body_md: string;
  sources: { title: string; url: string }[];
  partial: boolean;
}

export interface RunnerIO {
  loadContext(task: TaskRow): Promise<{ business: BusinessProfile | null; earlier: { title: string; excerpt: string }[] }>;
  addEvent(task: TaskRow, type: "step" | "search" | "fetch" | "note", text: string): Promise<void>;
  complete(task: TaskRow, d: DeliverableInput, costUsd: number): Promise<string>;
  /** False once the task has left 'running' (e.g. the sweeper failed and refunded it). */
  isStillRunning(task: TaskRow): Promise<boolean>;
}

/** A failure the user should see as-is; never retried. */
export class TaskError extends Error {}

const TURN_MAX_TOKENS = 32000;
const EXTRA_TURNS_AFTER_BUDGET = 3;
/** Wall-clock budget, kept well under the queue's 15-minute job expiry so a long run wraps up with a partial report. */
export const WALL_CLOCK_BUDGET_MS = 12 * 60_000;
const WRAP_UP =
  "You have reached the research budget for this task. Do not search or fetch anything else. Call save_deliverable now with the best report you can write from what you have found, and set partial to true.";
const NUDGE = "You have not saved the report yet. Call save_deliverable now with the complete report.";

const LogStep = z.object({ text: z.string().min(1).max(300) });
const SaveDeliverable = z.object({
  title: z.string().min(1).max(200),
  body_md: z.string().min(1),
  sources: z
    .array(z.object({ title: z.string().max(300), url: z.string().url().refine((u) => /^https?:\/\//i.test(u), "Source URLs must start with http:// or https://") }))
    .max(100),
  partial: z.boolean().optional(),
});

const LOG_STEP_TOOL: Anthropic.Beta.BetaTool = {
  name: "log_step",
  description: "Show the user a short progress update (under 12 words) as you start a new phase of research.",
  input_schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
  eager_input_streaming: true,
};

const SAVE_TOOL: Anthropic.Beta.BetaTool = {
  name: "save_deliverable",
  description: "Save the finished report. Call exactly once, at the end.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Short report title" },
      body_md: { type: "string", description: "The full report in markdown, following the template" },
      sources: {
        type: "array",
        items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" } }, required: ["title", "url"] },
      },
      partial: { type: "boolean", description: "True if the research budget ran out before you finished" },
    },
    required: ["title", "body_md", "sources"],
  },
  eager_input_streaming: true,
};

function webTools(remainingSearches: number, remainingFetches: number): Anthropic.Beta.BetaToolUnion[] {
  const tools: Anthropic.Beta.BetaToolUnion[] = [];
  if (remainingSearches > 0) tools.push({ type: "web_search_20260209", name: "web_search", max_uses: remainingSearches } as Anthropic.Beta.BetaToolUnion);
  if (remainingFetches > 0) tools.push({ type: "web_fetch_20260209", name: "web_fetch", max_uses: remainingFetches } as Anthropic.Beta.BetaToolUnion);
  return tools;
}

export async function runTask(
  task: TaskRow,
  deps: { llm: TaskLlm; io: RunnerIO; agent: AgentConfig; model: string; now?: () => number },
  meter: { usd: number } = { usd: 0 },
): Promise<{ deliverableId: string; costUsd: number }> {
  const kind = deps.agent.taskKinds[task.kind];
  if (!kind) throw new TaskError(`Unknown task type "${task.kind}".`);
  const { budget } = kind;
  const now = deps.now ?? Date.now;
  const deadline = now() + WALL_CLOCK_BUDGET_MS;

  const ctx = await deps.io.loadContext(task);
  const system = deps.agent.taskSystemPrompt(ctx.business, task.kind);
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: deps.agent.taskUserPrompt(task.brief, ctx.earlier) }];
  const used = { turns: 0, searches: 0, fetches: 0, outputTokens: 0 };
  let wrappingUp = false;
  let nudged = false;

  // Progress events are best-effort: a failed write must never crash the run or the process.
  const logEvent = (type: "step" | "search" | "fetch" | "note", text: string) => {
    deps.io.addEvent(task, type, text).catch((err) => console.error("task event write failed", err));
  };

  const onBlock = (b: Anthropic.Beta.BetaContentBlock) => {
    if (b.type !== "server_tool_use") return;
    const input = (b.input ?? {}) as { query?: string; url?: string };
    if (b.name === "web_search" && input.query) logEvent("search", `Searching: ${input.query}`.slice(0, 300));
    if (b.name === "web_fetch" && input.url) logEvent("fetch", `Reading ${input.url}`.slice(0, 300));
  };

  const save = async (d: DeliverableInput) => ({ deliverableId: await deps.io.complete(task, d, meter.usd), costUsd: meter.usd });

  while (true) {
    if (used.turns > 0 && !(await deps.io.isStillRunning(task))) {
      throw new TaskError("Buddy stopped because the task was cancelled.");
    }
    if (!wrappingUp && (used.turns >= budget.maxTurns || used.outputTokens >= budget.maxOutputTokens || now() >= deadline)) {
      wrappingUp = true;
      messages.push({ role: "user", content: WRAP_UP });
    }
    if (used.turns >= budget.maxTurns + EXTRA_TURNS_AFTER_BUDGET) {
      throw new TaskError("Buddy ran out of research budget before writing the report.");
    }

    const message = await deps.llm.run(
      {
        model: deps.model,
        system,
        messages,
        tools: wrappingUp ? [SAVE_TOOL] : [...webTools(budget.maxSearches - used.searches, budget.maxFetches - used.fetches), LOG_STEP_TOOL, SAVE_TOOL],
        maxTokens: TURN_MAX_TOKENS,
      },
      onBlock,
    );
    used.turns++;
    used.outputTokens += message.usage.output_tokens;
    used.searches += message.usage.server_tool_use?.web_search_requests ?? 0;
    used.fetches += message.usage.server_tool_use?.web_fetch_requests ?? 0;
    // Price by the model that actually served the turn (a server-side fallback may differ).
    meter.usd += costUsd(message.model || deps.model, message.usage);

    if (message.stop_reason === "refusal") throw new TaskError("Buddy declined this request. Try rephrasing the brief.");

    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }

    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) {
      const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
      if (nudged) {
        if (!text) throw new TaskError("Buddy finished without writing a report.");
        return save({ title: task.brief.summary.slice(0, 200), body_md: text, sources: [], partial: true });
      }
      nudged = true;
      messages.push({ role: "assistant", content: message.content });
      messages.push({ role: "user", content: NUDGE });
      continue;
    }

    messages.push({ role: "assistant", content: message.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      if (message.stop_reason === "max_tokens") {
        results.push({ type: "tool_result", tool_use_id: tu.id, is_error: true, content: "Your output was cut off. Call the tool again with a shorter input." });
        continue;
      }
      if (tu.name === "log_step") {
        const parsed = LogStep.safeParse(tu.input);
        if (parsed.success) logEvent("step", parsed.data.text);
        results.push({ type: "tool_result", tool_use_id: tu.id, content: "ok" });
      } else if (tu.name === "save_deliverable") {
        const parsed = SaveDeliverable.safeParse(tu.input);
        if (!parsed.success) {
          results.push({ type: "tool_result", tool_use_id: tu.id, is_error: true, content: `Invalid input: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}` });
          continue;
        }
        return save({ ...parsed.data, partial: Boolean(parsed.data.partial) || wrappingUp });
      } else {
        results.push({ type: "tool_result", tool_use_id: tu.id, is_error: true, content: `Unknown tool ${tu.name}` });
      }
    }
    messages.push({ role: "user", content: results });
  }
}
