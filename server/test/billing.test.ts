import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { makeTestDb } from "./helpers/db.js";
import { creditBalance } from "../src/credits.js";
import { createCheckoutSession, grantAllDue, handleStripeEvent, syncCheckoutSession, upsertSubscription, getSubscription } from "../src/billing/billing.js";

let t: Awaited<ReturnType<typeof makeTestDb>>;
let userId: string;
beforeEach(async () => { t = await makeTestDb(); userId = await t.createUser("ada@example.com"); });
afterEach(async () => { await t.close(); });

const START = Math.floor(new Date("2026-09-01T00:00:00Z").getTime() / 1000);
const sub = (over: Partial<Record<string, unknown>> = {}) =>
  ({
    id: "sub_1",
    customer: "cus_1",
    status: "active",
    start_date: START,
    metadata: { userId, planId: "12-month" },
    items: { data: [{ current_period_end: START + 365 * 86400 }] },
    ...over,
  }) as unknown as Stripe.Subscription;

function fakeStripe() {
  const created: any[] = [];
  let retrieveResult = sub();
  return {
    created,
    customers: { create: async (p: any) => { created.push(["customer", p]); return { id: "cus_1" }; } },
    prices: { list: async (p: any) => ({ data: [{ id: `price_${p.lookup_keys[0]}` }] }) },
    checkout: {
      sessions: {
        create: async (p: any) => { created.push(["session", p]); return { url: "https://checkout.stripe.test/s" }; },
        retrieve: async () => ({ client_reference_id: userId, subscription: sub() }),
      },
    },
    subscriptions: {
      retrieve: async () => retrieveResult,
      // Test-controlled: handleStripeEvent must re-fetch rather than trust the event payload.
      setRetrieveResult(s: Stripe.Subscription) { retrieveResult = s; },
    },
    billingPortal: { sessions: { create: async () => ({ url: "https://billing.stripe.test" }) } },
    webhooks: {} as any,
  } as any;
}

describe("billing", () => {
  it("creates a subscription checkout for the plan's lookup key and stores the customer", async () => {
    const stripe = fakeStripe();
    const url = await createCheckoutSession(t.db, stripe, { userId, email: "ada@example.com", planId: "3-month", appUrl: "http://localhost:5173" });
    expect(url).toBe("https://checkout.stripe.test/s");
    const session = stripe.created.find((c: any) => c[0] === "session")[1];
    expect(session).toMatchObject({
      mode: "subscription",
      customer: "cus_1",
      client_reference_id: userId,
      line_items: [{ price: "price_res_3-month", quantity: 1 }],
      subscription_data: { metadata: { userId, planId: "3-month" } },
    });
    expect(session.success_url).toContain("/app?checkout=success&session_id={CHECKOUT_SESSION_ID}");
    await createCheckoutSession(t.db, stripe, { userId, email: "ada@example.com", planId: "3-month", appUrl: "http://x" });
    expect(stripe.created.filter((c: any) => c[0] === "customer")).toHaveLength(1);
  });

  it("activates the subscription and grants the first month's credits", async () => {
    await upsertSubscription(t.db, sub(), new Date("2026-09-02T00:00:00Z"));
    expect(await getSubscription(t.db, userId)).toMatchObject({ plan_id: "12-month", status: "active" });
    expect(await creditBalance(t.db, userId)).toBe(200);
  });

  it("grants credits once even if sync and webhook both arrive, in any order", async () => {
    const stripe = fakeStripe();
    expect(await syncCheckoutSession(t.db, stripe, userId, "cs_1")).toBe(true);
    const event = { id: "evt_1", type: "customer.subscription.updated", data: { object: sub() } } as unknown as Stripe.Event;
    expect(await handleStripeEvent(t.db, stripe, event)).toBe("processed");
    expect(await handleStripeEvent(t.db, stripe, event)).toBe("duplicate");
    expect(await creditBalance(t.db, userId)).toBe(200);
  });

  it("refuses to sync someone else's checkout session", async () => {
    const stripe = fakeStripe();
    stripe.checkout.sessions.retrieve = async () => ({ client_reference_id: "someone-else", subscription: sub() });
    expect(await syncCheckoutSession(t.db, stripe, userId, "cs_1")).toBe(false);
    expect(await getSubscription(t.db, userId)).toBeNull();
  });

  it("refreshes credits each month on annual plans without rolling over", async () => {
    await upsertSubscription(t.db, sub(), new Date("2026-09-02T00:00:00Z"));
    await grantAllDue(t.db, new Date("2026-10-01T00:00:01Z"));
    await grantAllDue(t.db, new Date("2026-10-15T00:00:00Z"));
    expect(await creditBalance(t.db, userId)).toBe(200);
    const { rows } = await t.db.query("select count(*)::int as n from credit_ledger where reason = 'grant'");
    expect(rows[0].n).toBe(2);
  });

  it("stops granting when the subscription is cancelled", async () => {
    await upsertSubscription(t.db, sub(), new Date("2026-09-02T00:00:00Z"));
    await upsertSubscription(t.db, sub({ status: "canceled" }), new Date("2026-09-03T00:00:00Z"));
    await grantAllDue(t.db, new Date("2026-10-02T00:00:00Z"));
    const { rows } = await t.db.query("select count(*)::int as n from credit_ledger where reason = 'grant'");
    expect(rows[0].n).toBe(1);
  });

  it("ignores subscriptions without our metadata", async () => {
    const stripe = fakeStripe();
    stripe.subscriptions.setRetrieveResult(sub({ metadata: {} }));
    const event = { id: "evt_2", type: "customer.subscription.updated", data: { object: sub({ metadata: {} }) } } as unknown as Stripe.Event;
    expect(await handleStripeEvent(t.db, stripe, event)).toBe("ignored");
  });

  it("re-fetches the subscription instead of trusting a stale event payload", async () => {
    const stripe = fakeStripe();
    // The event payload says canceled, but the live subscription (re-fetched) is still active.
    stripe.subscriptions.setRetrieveResult(sub({ status: "active" }));
    const event = { id: "evt_3", type: "customer.subscription.deleted", data: { object: sub({ status: "canceled" }) } } as unknown as Stripe.Event;
    expect(await handleStripeEvent(t.db, stripe, event)).toBe("processed");
    expect(await getSubscription(t.db, userId)).toMatchObject({ status: "active" });
  });

  it("keeps the newer subscription when a stale cancel for an older one arrives late", async () => {
    await upsertSubscription(t.db, sub({ id: "sub_1", status: "canceled" }), new Date("2026-09-02T00:00:00Z"));
    await upsertSubscription(t.db, sub({ id: "sub_2", status: "active" }), new Date("2026-09-05T00:00:00Z"));
    await upsertSubscription(t.db, sub({ id: "sub_1", status: "canceled" }), new Date("2026-09-06T00:00:00Z"));
    expect(await getSubscription(t.db, userId)).toMatchObject({ status: "active", stripe_subscription_id: "sub_2" });
    expect(await creditBalance(t.db, userId)).toBe(200);
  });
});
