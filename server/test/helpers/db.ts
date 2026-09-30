import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import type { Db } from "../../src/db.js";
import { applyMigrations } from "../../src/migrations.js";

const shim = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "supabase-shim.sql"), "utf8");

export async function makeTestDb() {
  const pg = new PGlite();
  // PGlite otherwise defaults the session timezone to the host's local offset, so a bare
  // date literal (e.g. '2026-09-01') cast to timestamptz lands at the wrong instant.
  await pg.exec("set timezone = 'UTC'");
  await pg.exec(shim);
  const db: Db & { exec(sql: string): Promise<unknown> } = {
    query: (text, params) => pg.query(text, params as any[]) as any,
    exec: (sql) => pg.exec(sql),
  };
  await applyMigrations(db);
  return {
    db,
    async createUser(email = `u${Math.random().toString(36).slice(2)}@example.com`): Promise<string> {
      const { rows } = await db.query<{ id: string }>(
        "insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id",
        [email, JSON.stringify({ full_name: "Test User" })],
      );
      return rows[0].id;
    },
    close: () => pg.close(),
  };
}
