import pg from "pg";

/** Minimal query surface shared by the pg Pool (runtime) and PGlite (tests). */
export interface Db {
  query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export function createPool(connectionString: string): Db & { end(): Promise<void> } {
  const pool = new pg.Pool({ connectionString, max: 10 });
  return {
    query: (text, params) => pool.query(text, params as any[]) as any,
    end: () => pool.end(),
  };
}
