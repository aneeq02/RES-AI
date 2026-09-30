import type Stripe from "stripe";
import type { Db } from "../db.js";
import { grantPeriodCredits } from "../credits.js";
import { creditPeriod } from "../period.js";
import { PLANS, isPlanId, lookupKey, type PlanId } from "../plans.js";

export type StripeLike = Pick<Stripe, "customers" | "checkout" | "subscriptions" | "billingPortal" | "prices" | "webhooks">;

const ACTIVE = new Set(["active", "trialing"]);

export interface SubscriptionRow {
  plan_id: PlanId;
  status: string;
  started_at: Date;
  current_period_end: Date | null;
  stripe_subscription_id: string;
}

export const isActive = (s: SubscriptionRow | null): s is SubscriptionRow => Boolean(s && ACTIVE.has(s.status));

export async function getSubscription(db: Db, userId: string): Promise<SubscriptionRow | null> {
  const { rows } = await db.query<SubscriptionRow>(
    "select plan_id, status, started_at, current_period_end, stripe_subscription_id from subscriptions where user_id = $1",
    [userId],
  );
  return rows[0] ?? null;
}

async function customerFor(db: Db, stripe: StripeLike, userId: string, email: string): Promise<string> {
  const { rows } = await db.query<{ stripe_customer_id: string | null }>("select stripe_customer_id from profiles where id = $1", [userId]);
  if (rows[0]?.stripe_customer_id) return rows[0].stripe_customer_id;
  const customer = await stripe.customers.create({ email, metadata: { userId } });
  await db.query("update profiles set stripe_customer_id = $2 where id = $1", [userId, customer.id]);
  return customer.id;
}

export async function createCheckoutSession(db: Db, stripe: StripeLike, p: { userId: string; email: string; planId: PlanId; appUrl: string }): Promise<string> {
  const customer = await customerFor(db, stripe, p.userId, p.email);
  const prices = await stripe.prices.list({ lookup_keys: [lookupKey(p.planId)], active: true, limit: 1 });
  const price = prices.data[0];
  if (!price) throw new Error(`No Stripe price with lookup key ${lookupKey(p.planId)}. Run npm --prefix server run stripe:setup.`);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: p.userId,
    line_items: [{ price: price.id, quantity: 1 }],
    subscription_data: { metadata: { userId: p.userId, planId: p.planId } },
    success_url: `${p.appUrl}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${p.appUrl}/checkout?plan=${p.planId}&canceled=1`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export async function upsertSubscription(db: Db, sub: Stripe.Subscription, now = new Date()): Promise<void> {
  const userId = sub.metadata?.userId;
  const planId = sub.metadata?.planId;
  if (!userId || !isPlanId(planId)) return;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  await db.query(
    `insert into subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, started_at, current_period_end)
     values ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7))
     on conflict (user_id) do update set
       stripe_customer_id = excluded.stripe_customer_id,
       stripe_subscription_id = excluded.stripe_subscription_id,
       plan_id = excluded.plan_id,
       status = excluded.status,
       started_at = excluded.started_at,
       current_period_end = excluded.current_period_end`,
    [userId, customer, sub.id, planId, sub.status, sub.start_date, periodEnd ?? null],
  );
  await grantDueCredits(db, userId, now);
}

export async function grantDueCredits(db: Db, userId: string, now = new Date()): Promise<void> {
  const sub = await getSubscription(db, userId);
  if (!isActive(sub)) return;
  const period = creditPeriod(new Date(sub.started_at), now);
  await grantPeriodCredits(db, userId, PLANS[sub.plan_id].credits, `${sub.stripe_subscription_id}:${period.index}`);
}

export async function grantAllDue(db: Db, now = new Date()): Promise<void> {
  const { rows } = await db.query<{ user_id: string }>("select user_id from subscriptions where status in ('active', 'trialing')");
  for (const r of rows) await grantDueCredits(db, r.user_id, now);
}

export async function syncCheckoutSession(db: Db, stripe: StripeLike, userId: string, sessionId: string): Promise<boolean> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  if (session.client_reference_id !== userId || !session.subscription) return false;
  const sub = typeof session.subscription === "string" ? await stripe.subscriptions.retrieve(session.subscription) : session.subscription;
  await upsertSubscription(db, sub as Stripe.Subscription);
  return true;
}

export async function createPortalSession(db: Db, stripe: StripeLike, userId: string, appUrl: string): Promise<string | null> {
  const { rows } = await db.query<{ stripe_customer_id: string | null }>("select stripe_customer_id from profiles where id = $1", [userId]);
  const customer = rows[0]?.stripe_customer_id;
  if (!customer) return null;
  const session = await stripe.billingPortal.sessions.create({ customer, return_url: `${appUrl}/app/settings` });
  return session.url;
}

/** Idempotent: the same event id is processed once; subscription upserts and grants are idempotent anyway. */
export async function handleStripeEvent(db: Db, stripe: StripeLike, event: Stripe.Event): Promise<"processed" | "duplicate" | "ignored"> {
  const seen = await db.query("select 1 from stripe_events where event_id = $1", [event.id]);
  if (seen.rows.length) return "duplicate";

  let sub: Stripe.Subscription | null = null;
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.subscription) sub = typeof s.subscription === "string" ? await stripe.subscriptions.retrieve(s.subscription) : s.subscription;
  } else if (event.type.startsWith("customer.subscription.")) {
    sub = event.data.object as Stripe.Subscription;
  }

  const ours = Boolean(sub?.metadata?.userId && isPlanId(sub.metadata.planId));
  if (sub && ours) await upsertSubscription(db, sub);
  await db.query("insert into stripe_events (event_id) values ($1) on conflict do nothing", [event.id]);
  return ours ? "processed" : "ignored";
}
