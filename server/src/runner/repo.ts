import type { Db } from "../db.js";
import { failTask } from "../credits.js";
import type { BusinessProfile } from "../agents/types.js";
import type { RunnerIO, TaskRow } from "./runTask.js";

export async function claimTask(db: Db, taskId: string): Promise<TaskRow | null> {
  const { rows } = await db.query<TaskRow>(
    `update tasks set status = 'running', attempts = attempts + 1, started_at = now()
     where id = $1 and status = 'queued'
     returning id, user_id, agent_id, thread_id, kind, brief, attempts`,
    [taskId],
  );
  return rows[0] ?? null;
}

export async function requeueTask(db: Db, taskId: string): Promise<void> {
  await db.query("update tasks set status = 'queued', queued_at = now() where id = $1 and status = 'running'", [taskId]);
}

export async function setTaskCost(db: Db, taskId: string, usd: number): Promise<void> {
  await db.query("update tasks set cost_usd = cost_usd + $2 where id = $1", [taskId, usd]);
}

export async function loadBusiness(db: Db, userId: string): Promise<BusinessProfile | null> {
  const { rows } = await db.query(
    "select company, website, industry, audience, competitors, brand_voice from business_profiles where user_id = $1",
    [userId],
  );
  const r = rows[0];
  return r ? { company: r.company, website: r.website, industry: r.industry, audience: r.audience, competitors: r.competitors, brandVoice: r.brand_voice } : null;
}

export async function sweepStaleTasks(db: Db, olderThanMinutes: number, queuedOlderThanMinutes = 30): Promise<string[]> {
  const { rows: running } = await db.query<{ id: string }>(
    `select id from tasks where status = 'running' and started_at < now() - make_interval(mins => $1)`,
    [olderThanMinutes],
  );
  for (const { id } of running) await failTask(db, id, "Buddy took too long and stopped. Your credits were refunded.");

  const { rows: queued } = await db.query<{ id: string }>(
    `select id from tasks where status = 'queued' and queued_at < now() - make_interval(mins => $1)`,
    [queuedOlderThanMinutes],
  );
  for (const { id } of queued) await failTask(db, id, "Buddy couldn't get started. Your credits were refunded.");

  return [...running.map((r) => r.id), ...queued.map((r) => r.id)];
}

export function dbRunnerIO(db: Db): RunnerIO {
  return {
    async loadContext(task) {
      const business = await loadBusiness(db, task.user_id);
      const { rows } = await db.query<{ title: string; body_md: string }>(
        "select title, body_md from deliverables where user_id = $1 and agent_id = $2 order by created_at desc limit 3",
        [task.user_id, task.agent_id],
      );
      return { business, earlier: rows.map((r) => ({ title: r.title, excerpt: r.body_md.slice(0, 3000) })) };
    },
    async addEvent(task, type, text) {
      await db.query("insert into task_events (task_id, user_id, type, text) values ($1, $2, $3, $4)", [task.id, task.user_id, type, text.slice(0, 300)]);
    },
    async complete(task, d, costUsd) {
      // One statement: deliverable, task status and the thread message land together.
      const { rows } = await db.query<{ id: string }>(
        `with d as (
           insert into deliverables (task_id, user_id, agent_id, title, body_md, sources, partial)
           values ($1, $2, $3, $4, $5, $6::jsonb, $7) returning id
         ), t as (
           update tasks set status = 'done', finished_at = now(), cost_usd = cost_usd + $8
           where id = $1 and status = 'running' returning thread_id, user_id
         ), m as (
           insert into messages (thread_id, user_id, role, content)
           select t.thread_id, t.user_id, 'assistant', jsonb_build_array(jsonb_build_object('type', 'deliverable', 'deliverableId', d.id))
           from t, d returning 1
         ), th as (
           update threads set updated_at = now() where id = (select thread_id from t) returning 1
         )
         select id from d`,
        [task.id, task.user_id, task.agent_id, d.title, d.body_md, JSON.stringify(d.sources), d.partial, costUsd],
      );
      return rows[0].id;
    },
  };
}
