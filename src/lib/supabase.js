const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// false when env is missing (e.g. a marketing-only build); auth UI shows a setup message instead.
// Written as a ternary so the bundler folds it to a constant and drops supabase-js entirely then.
export const supabaseConfigured = url && key ? true : false;

let client = null;

/**
 * The Supabase client, or null when unconfigured. supabase-js is imported on first use so it
 * stays out of the marketing pages' entry chunk; the client is created once and cached.
 */
export async function getSupabase() {
  if (!supabaseConfigured) return null;
  client ??= import("@supabase/supabase-js").then(({ createClient }) => createClient(url, key));
  try {
    return await client;
  } catch (err) {
    client = null; // let a later call retry a failed chunk load
    throw err;
  }
}
