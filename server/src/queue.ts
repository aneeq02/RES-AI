import { PgBoss } from "pg-boss";

export const TASK_QUEUE = "agent-tasks";

type Outcome = "done" | "failed" | "retry" | "skipped";

export async function startQueue(opts: { connectionString: string; handle(taskId: string): Promise<Outcome> }) {
  const boss = new PgBoss(opts.connectionString);
  boss.on("error", (err) => console.error("pg-boss", err));
  await boss.start();
  await boss.createQueue(TASK_QUEUE, { retryLimit: 2, retryDelay: 20, retryBackoff: true, expireInSeconds: 900 });

  await boss.work<{ taskId: string }>(TASK_QUEUE, async ([job]) => {
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
