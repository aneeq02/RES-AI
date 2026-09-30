import pg from "pg";
import { applyMigrations } from "../src/migrations.js";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const applied = await applyMigrations({
    query: (t, p) => client.query(t, p as any[]) as any,
    exec: (sql) => client.query(sql),
  });
  console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date.");
} finally {
  await client.end();
}
