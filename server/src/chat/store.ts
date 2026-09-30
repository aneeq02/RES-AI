import type { Db } from "../db.js";
import type { StoredBlock } from "./history.js";

export const CHAT_RATE_LIMIT = 60;
const HISTORY = 30;

export async function countRecentUserMessages(db: Db, userId: string): Promise<number> {
  const { rows } = await db.query<{ n: number }>(
    "select count(*)::int as n from messages where user_id = $1 and role = 'user' and created_at > now() - interval '1 hour'",
    [userId],
  );
  return rows[0].n;
}

export async function insertMessage(db: Db, threadId: string, userId: string, role: "user" | "assistant", content: StoredBlock[]): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    "insert into messages (thread_id, user_id, role, content) values ($1, $2, $3, $4::jsonb) returning id",
    [threadId, userId, role, JSON.stringify(content)],
  );
  return rows[0].id;
}

export async function updateMessage(db: Db, id: string, content: StoredBlock[]): Promise<void> {
  await db.query("update messages set content = $2::jsonb where id = $1", [id, JSON.stringify(content)]);
}

export async function loadHistory(db: Db, threadId: string) {
  const { rows } = await db.query<{ role: "user" | "assistant"; content: StoredBlock[] }>(
    `select role, content from (
       select role, content, created_at from messages where thread_id = $1 order by created_at desc limit ${HISTORY}
     ) recent order by created_at`,
    [threadId],
  );
  const taskIds = rows.flatMap((r) => r.content.flatMap((b) => (b.type === "task" ? [b.taskId] : [])));
  const deliverableIds = rows.flatMap((r) => r.content.flatMap((b) => (b.type === "deliverable" ? [b.deliverableId] : [])));
  const tasks = new Map(
    taskIds.length
      ? (await db.query("select id, kind, status, brief from tasks where id = any($1::uuid[])", [taskIds])).rows.map((t) => [t.id, t] as const)
      : [],
  );
  const deliverables = new Map(
    deliverableIds.length
      ? (await db.query("select id, title, body_md from deliverables where id = any($1::uuid[])", [deliverableIds])).rows.map((d) => [d.id, d] as const)
      : [],
  );
  return { rows, tasks, deliverables };
}

export async function createProposedTask(
  db: Db,
  p: { userId: string; agentId: string; threadId: string; kind: string; summary: string; details: string; credits: number },
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `insert into tasks (user_id, agent_id, thread_id, kind, brief, credits_charged)
     values ($1, $2, $3, $4, $5::jsonb, $6) returning id`,
    [p.userId, p.agentId, p.threadId, p.kind, JSON.stringify({ summary: p.summary, details: p.details }), p.credits],
  );
  return rows[0].id;
}

export async function touchThread(db: Db, threadId: string, firstUserText: string): Promise<void> {
  await db.query(
    `update threads set updated_at = now(),
       title = case when title = 'New chat' then left($2, 60) else title end
     where id = $1`,
    [threadId, firstUserText.replace(/\s+/g, " ").trim()],
  );
}
