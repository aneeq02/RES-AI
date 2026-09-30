import Anthropic from "@anthropic-ai/sdk";
import type { Db } from "./db.js";
import { failTask } from "./credits.js";
import { getAgent } from "./agents/registry.js";
import { claimTask, dbRunnerIO, requeueTask, setTaskCost } from "./runner/repo.js";
import { runTask, TaskError } from "./runner/runTask.js";
import type { TaskLlm } from "./runner/llm.js";

export const MAX_ATTEMPTS = 3;

export function isRetryable(err: unknown): boolean {
  return (
    err instanceof Anthropic.RateLimitError ||
    err instanceof Anthropic.InternalServerError ||
    err instanceof Anthropic.APIConnectionError ||
    (err instanceof Anthropic.APIError && typeof err.status === "number" && err.status >= 500)
  );
}

export async function processTaskJob(deps: { db: Db; llm: TaskLlm; model: string }, taskId: string) {
  const task = await claimTask(deps.db, taskId);
  if (!task) return "skipped" as const;
  const agent = getAgent(task.agent_id);
  if (!agent) {
    await failTask(deps.db, task.id, "This agent isn't available yet. Your credits were refunded.");
    return "failed" as const;
  }
  const meter = { usd: 0 };
  try {
    await runTask(task, { llm: deps.llm, io: dbRunnerIO(deps.db), agent, model: deps.model }, meter);
    return "done" as const;
  } catch (err) {
    await setTaskCost(deps.db, task.id, meter.usd);
    if (isRetryable(err) && task.attempts < MAX_ATTEMPTS) {
      await requeueTask(deps.db, task.id);
      return "retry" as const;
    }
    const message = err instanceof TaskError ? `${err.message} Your credits were refunded.` : "Something went wrong while Buddy was working. Your credits were refunded.";
    if (!(err instanceof TaskError)) console.error(`task ${task.id} failed`, err);
    await failTask(deps.db, task.id, message);
    return "failed" as const;
  }
}
