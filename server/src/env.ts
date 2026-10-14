import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8787),
  APP_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().optional().transform((v) => v || undefined),
  // Dev only: scripted replies instead of Anthropic calls, so the whole product runs without an API key.
  FAKE_AI: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
  CHAT_MODEL: z.string().default("claude-sonnet-5"),
  TASK_MODEL: z.string().default("claude-opus-5"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_test_", "Use a Stripe test-mode key until launch"),
  STRIPE_WEBHOOK_SECRET: z.string().optional().transform((v) => v || undefined),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid server environment (see server/.env.example):\n${issues}`);
  }
  const env = parsed.data;
  if (env.FAKE_AI && source.NODE_ENV === "production") throw new Error("FAKE_AI must not be enabled in production.");
  if (!env.FAKE_AI && !env.ANTHROPIC_API_KEY) throw new Error("Invalid server environment (see server/.env.example):\n  ANTHROPIC_API_KEY: required unless FAKE_AI=true");
  return env;
}
