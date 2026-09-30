import { createClient } from "@supabase/supabase-js";
import type { MiddlewareHandler } from "hono";

export interface AuthUser { id: string; email: string }
export type HonoEnv = { Variables: { user: AuthUser } };

export function supabaseTokenVerifier(url: string, serviceKey: string) {
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return async (token: string): Promise<AuthUser | null> => {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? "" };
  };
}

export function requireAuth(verify: (token: string) => Promise<AuthUser | null>): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
    const user = token ? await verify(token) : null;
    if (!user) return c.json({ error: "unauthorized" }, 401);
    c.set("user", user);
    await next();
  };
}
