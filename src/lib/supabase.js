import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// null when env is missing (e.g. a marketing-only build); auth UI shows a setup message instead.
export const supabase = url && key ? createClient(url, key) : null;
