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

  it("enables row level security on every app table", async () => {
    const { rows } = await t.db.query<{ relname: string; relrowsecurity: boolean }>(
      `select relname, relrowsecurity from pg_class
       where relnamespace = 'public'::regnamespace and relkind = 'r' and relname <> 'schema_migrations'`,
    );
    expect(rows.length).toBeGreaterThanOrEqual(10);
    expect(rows.filter((r) => !r.relrowsecurity)).toEqual([]);
  });

  it("publishes task progress tables to realtime", async () => {
    const { rows } = await t.db.query<{ tablename: string }>(
      "select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by tablename",
    );
    expect(rows.map((r) => r.tablename)).toEqual(["deliverables", "task_events", "tasks"]);
  });

  it("is idempotent when migrations run twice", async () => {
    const { applyMigrations } = await import("../src/migrations.js");
    await expect(applyMigrations(t.db as any)).resolves.toEqual([]);
  });
});
