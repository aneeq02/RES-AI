import pg from "pg";

/** Minimal query surface shared by the pg Pool (runtime) and PGlite (tests). */
export interface Db {
  query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export function createPool(connectionString: string): Db & { end(): Promise<void> } {
  // Kept small: pg-boss opens its own pool, and Supabase's session pooler allows few connections.
  const pool = new pg.Pool({ connectionString, max: 5 });
  // Without a listener, an idle client dropped by the server emits an unhandled 'error' and crashes the process.
  pool.on("error", (e) => console.error("pg pool error", e));
  return {
    query: (text, params) => pool.query(text, params as any[]) as any,
    end: () => pool.end(),
  };
}
