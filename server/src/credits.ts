import type { Db } from "./db.js";

export type ReserveResult = "ok" | "not_found" | "not_proposed" | "insufficient";

export async function reserveTaskCredits(db: Db, taskId: string): Promise<ReserveResult> {
  const { rows } = await db.query<{ r: ReserveResult }>("select public.reserve_task_credits($1) as r", [taskId]);
  return rows[0].r;
}

export async function failTask(db: Db, taskId: string, error: string): Promise<boolean> {
  const { rows } = await db.query<{ r: boolean }>("select public.fail_task($1, $2) as r", [taskId, error.slice(0, 500)]);
  return rows[0].r;
}

export async function grantPeriodCredits(db: Db, userId: string, amount: number, ref: string): Promise<boolean> {
  const { rows } = await db.query<{ r: boolean }>("select public.grant_period_credits($1, $2, $3) as r", [userId, amount, ref]);
  return rows[0].r;
}

export async function creditBalance(db: Db, userId: string): Promise<number> {
  const { rows } = await db.query<{ b: number }>("select public.credit_balance($1) as b", [userId]);
  return Number(rows[0].b);
}
