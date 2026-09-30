import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Db } from "../db.js";
import type { AgentConfig } from "../agents/types.js";
import { loadBusiness } from "../runner/repo.js";
import { toApiMessages, type StoredBlock } from "./history.js";
import type { ChatLlm } from "./llm.js";
import { createProposedTask, insertMessage, loadHistory, touchThread, updateMessage } from "./store.js";

export type ChatEvent =
  | { event: "text"; data: { delta: string } }
  | { event: "task_proposed"; data: { taskId: string } }
  | { event: "done"; data: { messageId: string } }
  | { event: "error"; data: { message: string } };

const SAVE_EVERY_MS = 1000;

function startTaskTool(agent: AgentConfig): Anthropic.Tool {
  return {
    name: "start_task",
    description: "Propose a background research task. The user sees its cost and must approve it before anything runs.",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: Object.keys(agent.taskKinds) },
        summary: { type: "string", description: "One sentence describing the research" },
        details: { type: "string", description: "Everything the researcher needs: names, markets, regions, time frame, the decision being made" },
      },
      required: ["kind", "summary"],
    },
    eager_input_streaming: true,
  };
}

export async function sendChatMessage(
  deps: { db: Db; llm: ChatLlm; model: string },
  args: { userId: string; threadId: string; agent: AgentConfig; text: string; emit(e: ChatEvent): Promise<void> | void },
): Promise<void> {
  const { db } = deps;
  const { userId, threadId, agent } = args;
  // A failed emit means the browser went away; keep working and save everything.
  let connected = true;
  const emit = async (e: ChatEvent) => {
    if (!connected) return;
    try { await args.emit(e); } catch { connected = false; }
  };

  await insertMessage(db, threadId, userId, "user", [{ type: "text", text: args.text }]);
  await touchThread(db, threadId, args.text);
  const history = await loadHistory(db, threadId);
  const business = await loadBusiness(db, userId);
  const assistantId = await insertMessage(db, threadId, userId, "assistant", []);

  let text = "";
  let lastSave = Date.now();
  const content = (): StoredBlock[] => (text ? [{ type: "text", text }] : []);

  // Serialize every write to the assistant row through one promise chain, so a slow
  // in-flight autosave can never resolve after (and overwrite) the final write.
  let saving: Promise<void> = Promise.resolve();
  const save = (c: StoredBlock[]): Promise<void> =>
    (saving = saving.then(() => updateMessage(db, assistantId, c)).catch((err) => console.error("chat autosave failed", err)));

  try {
    const message = await deps.llm.stream(
      {
        model: deps.model,
        system: agent.chatSystemPrompt(business),
        messages: toApiMessages(history.rows, history.tasks, history.deliverables),
        tools: [startTaskTool(agent)],
      },
      (delta) => {
        text += delta;
        void emit({ event: "text", data: { delta } });
        if (Date.now() - lastSave > SAVE_EVERY_MS) {
          lastSave = Date.now();
          void save(content());
        }
      },
    );

    const blocks = content();
    const StartTask = z.object({
      kind: z.enum(Object.keys(agent.taskKinds) as [string, ...string[]]),
      summary: z.string().min(1).max(500),
      details: z.string().max(4000).optional().default(""),
    });
    for (const b of message.content) {
      if (b.type !== "tool_use" || b.name !== "start_task") continue;
      const parsed = StartTask.safeParse(b.input);
      if (!parsed.success) {
        blocks.push({ type: "text", text: "(I couldn't set that task up. Try rephrasing what you need.)" });
        continue;
      }
      const taskId = await createProposedTask(db, {
        userId,
        agentId: agent.id,
        threadId,
        kind: parsed.data.kind,
        summary: parsed.data.summary,
        details: parsed.data.details,
        credits: agent.taskKinds[parsed.data.kind].credits,
      });
      blocks.push({ type: "task", taskId });
      await emit({ event: "task_proposed", data: { taskId } });
    }
    await save(blocks);
    await emit({ event: "done", data: { messageId: assistantId } });
  } catch (err) {
    console.error("chat failed", err);
    await save(content());
    await emit({ event: "error", data: { message: "Buddy couldn't reply just now. Please try again." } });
  }
}
