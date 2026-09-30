import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestDb } from "./helpers/db.js";

let t: Awaited<ReturnType<typeof makeTestDb>>;
beforeEach(async () => { t = await makeTestDb(); });
afterEach(async () => { await t.close(); });

describe("schema", () => {
  it("creates a profile when an auth user signs up", async () => {
    const id = await t.createUser("ada@example.com");
    const { rows } = await t.db.query("select id, name, onboarded_at from public.profiles where id = $1", [id]);
    expect(rows).toEqual([{ id, name: "Test User", onboarded_at: null }]);
  });

  it("enables row level security on every public table, including schema_migrations", async () => {
    const { rows } = await t.db.query<{ relname: string; relrowsecurity: boolean }>(
      `select relname, relrowsecurity from pg_class
       where relnamespace = 'public'::regnamespace and relkind = 'r'`,
    );
    expect(rows.map((r) => r.relname)).toContain("schema_migrations");
    expect(rows.length).toBeGreaterThanOrEqual(10);
    expect(rows.filter((r) => !r.relrowsecurity)).toEqual([]);
  });

  it("publishes task progress tables to realtime", async () => {
    const { rows } = await t.db.query<{ tablename: string }>(
      "select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by tablename",
    );
    expect(rows.map((r) => r.tablename)).toEqual(["deliverables", "task_events", "tasks"]);
  });

  it("does not let anon or authenticated clients call the credit functions", async () => {
    const fns = ["public.credit_balance(uuid)", "public.reserve_task_credits(uuid)", "public.fail_task(uuid, text)", "public.grant_period_credits(uuid, int, text)"];
    for (const role of ["anon", "authenticated"]) {
      for (const fn of fns) {
        const { rows } = await t.db.query<{ ok: boolean }>("select has_function_privilege($1, $2, 'execute') as ok", [role, fn]);
        expect({ role, fn, ok: rows[0].ok }).toEqual({ role, fn, ok: false });
      }
    }
  });

  it("rolls back a failing migration file entirely, leaving no partial objects or tracking row", async () => {
    const { applyMigrations } = await import("../src/migrations.js");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "res-migrations-"));
    try {
      fs.writeFileSync(path.join(dir, "9001_good.sql"), "create table public.mig_good (id int);");
      fs.writeFileSync(path.join(dir, "9002_bad.sql"), "create table public.mig_partial (id int);\nselect public.no_such_function();");
      await expect(applyMigrations(t.db as any, dir)).rejects.toThrow(/no_such_function/);
      const tables = (await t.db.query<{ n: string }>("select relname as n from pg_class where relname in ('mig_good', 'mig_partial')")).rows.map((r) => r.n);
      expect(tables).toEqual(["mig_good"]);
      const tracked = (await t.db.query<{ name: string }>("select name from public.schema_migrations where name like '900%' order by name")).rows.map((r) => r.name);
      expect(tracked).toEqual(["9001_good.sql"]);
      // The connection is usable again (not stuck in an aborted transaction).
      await expect(t.db.query("select 1 as one")).resolves.toMatchObject({ rows: [{ one: 1 }] });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("rolls back a migration's changes when its tracking row can't be written", async () => {
    const { applyMigrations } = await import("../src/migrations.js");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "res-migrations-"));
    try {
      // The file itself succeeds, but it makes its own tracking insert fail.
      fs.writeFileSync(
        path.join(dir, "9003_untracked.sql"),
        "create table public.mig_untracked (id int);\nalter table public.schema_migrations add constraint no_9003 check (name not like '9003%');",
      );
      await expect(applyMigrations(t.db as any, dir)).rejects.toThrow(/no_9003/);
      expect((await t.db.query("select 1 from pg_class where relname = 'mig_untracked'")).rows).toEqual([]);
      expect((await t.db.query("select 1 from pg_constraint where conname = 'no_9003'")).rows).toEqual([]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("is idempotent when migrations run twice", async () => {
    const { applyMigrations } = await import("../src/migrations.js");
    await expect(applyMigrations(t.db as any)).resolves.toEqual([]);
  });
});
