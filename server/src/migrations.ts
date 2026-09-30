import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Db } from "./db.js";

export type MigrationDb = Db & { exec(sql: string): Promise<unknown> };

export const MIGRATIONS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../supabase/migrations");

/**
 * Applies every *.sql file in name order that isn't recorded yet. Each file and its tracking row
 * run in one transaction, so a failing file leaves nothing behind. Returns the files applied.
 * `db` must be a single connection (a pg Client or PGlite), not a pool, for the transaction to hold.
 */
export async function applyMigrations(db: MigrationDb, dir = MIGRATIONS_DIR): Promise<string[]> {
  await db.exec("create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  // The table lives in `public`, which PostgREST exposes; RLS with no policies hides it from anon/authenticated.
  await db.exec("alter table public.schema_migrations enable row level security");
  const done = new Set((await db.query<{ name: string }>("select name from public.schema_migrations")).rows.map((r) => r.name));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const applied: string[] = [];
  for (const file of files) {
    if (done.has(file)) continue;
    await db.exec("begin");
    try {
      await db.exec(fs.readFileSync(path.join(dir, file), "utf8"));
      await db.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await db.exec("commit");
    } catch (err) {
      await db.exec("rollback");
      throw err;
    }
    applied.push(file);
  }
  return applied;
}
