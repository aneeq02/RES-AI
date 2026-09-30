import Anthropic from "@anthropic-ai/sdk";
import { serve } from "@hono/node-server";
import Stripe from "stripe";
import { loadEnv } from "./env.js";
import { createPool } from "./db.js";
import { createApp } from "./http/app.js";
import { supabaseTokenVerifier } from "./http/auth.js";
import { anthropicChatLlm } from "./chat/llm.js";
import { anthropicTaskLlm } from "./runner/llm.js";
import { startQueue } from "./queue.js";
import { processTaskJob } from "./worker.js";
import { sweepStaleTasks } from "./runner/repo.js";
import { grantAllDue } from "./billing/billing.js";

const env = loadEnv();
const db = createPool(env.DATABASE_URL);
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 3 });
const taskLlm = anthropicTaskLlm(anthropic);

// This process is the only worker, so anything still "running" at boot was interrupted.
const interrupted = await sweepStaleTasks(db, 0);
if (interrupted.length) console.log(`Refunded ${interrupted.length} interrupted task(s)`);

const queue = await startQueue({
  connectionString: env.DATABASE_URL,
  handle: (taskId) => processTaskJob({ db, llm: taskLlm, model: env.TASK_MODEL }, taskId),
});

const every = (ms: number, fn: () => Promise<unknown>) => setInterval(() => fn().catch((e) => console.error(e)), ms);
every(5 * 60_000, () => sweepStaleTasks(db, 16));
every(60 * 60_000, () => grantAllDue(db));
await grantAllDue(db);

const app = createApp({
  db,
  verifyToken: supabaseTokenVerifier(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY),
  chatLlm: anthropicChatLlm(anthropic),
  draftLlm: { create: (p) => anthropic.messages.create(p) },
  stripe: new Stripe(env.STRIPE_SECRET_KEY),
  enqueueTask: queue.enqueueTask,
  appUrl: env.APP_URL,
  chatModel: env.CHAT_MODEL,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => console.log(`res API on http://localhost:${info.port}`));

const shutdown = async () => {
  await queue.stop();
  await db.end();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
