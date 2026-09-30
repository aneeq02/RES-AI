import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Db } from "./db.js";

export type MigrationDb = Db & { exec(sql: string): Promise<unknown> };

export const MIGRATIONS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../supabase/migrations");

/** Applies every *.sql file in name order that isn't recorded yet. Returns the files applied. */
export async function applyMigrations(db: MigrationDb, dir = MIGRATIONS_DIR): Promise<string[]> {
  await db.exec("create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  const done = new Set((await db.query<{ name: string }>("select name from public.schema_migrations")).rows.map((r) => r.name));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const applied: string[] = [];
  for (const file of files) {
    if (done.has(file)) continue;
    await db.exec(fs.readFileSync(path.join(dir, file), "utf8"));
    await db.query("insert into public.schema_migrations (name) values ($1)", [file]);
    applied.push(file);
  }
  return applied;
}
