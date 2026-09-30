import { PgBoss } from "pg-boss";
import { MAX_ATTEMPTS } from "./worker.js";

export const TASK_QUEUE = "agent-tasks";
export const WORKER_CONCURRENCY = 5;

type Outcome = "done" | "failed" | "retry" | "skipped";

export async function startQueue(opts: { connectionString: string; handle(taskId: string): Promise<Outcome> }) {
  const boss = new PgBoss(opts.connectionString);
  boss.on("error", (err) => console.error("pg-boss", err));
  await boss.start();
  // Note: these options only take effect when the queue is first created. pg-boss inserts the
  // queue with ON CONFLICT DO NOTHING, so changing them later requires boss.updateQueue().
  // pg-boss counts retries (attempts after the first), we count attempts (including the first) — so retryLimit is MAX_ATTEMPTS - 1.
  await boss.createQueue(TASK_QUEUE, { retryLimit: MAX_ATTEMPTS - 1, retryDelay: 20, retryBackoff: true, expireInSeconds: 900 });

  // Up to WORKER_CONCURRENCY tasks run at once in this process (pg-boss defaults to 1). Each
  // worker still fetches one job at a time (batchSize 1), so the handler receives [job].
  await boss.work<{ taskId: string }>(TASK_QUEUE, { localConcurrency: WORKER_CONCURRENCY }, async ([job]) => {
    const outcome = await opts.handle(job.data.taskId);
    // Throwing hands the job back to pg-boss for a delayed retry.
    if (outcome === "retry") throw new Error(`retrying task ${job.data.taskId}`);
  });

  return {
    async enqueueTask(taskId: string) {
      await boss.send(TASK_QUEUE, { taskId });
    },
    stop: () => boss.stop(),
  };
}
