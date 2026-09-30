import Stripe from "stripe";
import { PLANS, lookupKey, planAmountCents, type PlanId } from "../src/plans.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) throw new Error("Use a Stripe test-mode key.");

for (const id of Object.keys(PLANS) as PlanId[]) {
  const key = lookupKey(id);
  const existing = await stripe.prices.list({ lookup_keys: [key], limit: 1 });
  if (existing.data[0]) {
    console.log(`${key}: exists (${existing.data[0].id})`);
    continue;
  }
  const product = await stripe.products.create({ name: `res: ${PLANS[id].name}`, metadata: { planId: id } });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: planAmountCents(id),
    recurring: { interval: "month", interval_count: PLANS[id].months },
    lookup_key: key,
    transfer_lookup_key: true,
  });
  console.log(`${key}: created ${price.id}`);
}
