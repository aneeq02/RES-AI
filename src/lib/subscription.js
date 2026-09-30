/** True when the user's plan grants access right now. */
export const hasActivePlan = (me) => ["active", "trialing"].includes(me?.subscription?.status);

const NEEDS_PAYMENT = new Set(["past_due", "incomplete", "unpaid"]);

/**
 * True when a subscription exists but its last payment failed or never completed. These users must
 * fix payment in the billing portal: a fresh checkout would open a second subscription.
 */
export const subscriptionNeedsPayment = (me) => NEEDS_PAYMENT.has(me?.subscription?.status);
