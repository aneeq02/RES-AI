import { describe, expect, it } from "vitest";
import { hasActivePlan, subscriptionNeedsPayment } from "./subscription";

const me = (status) => ({ subscription: status ? { status } : null });

describe("subscription helpers", () => {
  it.each([
    ["active", true, false],
    ["trialing", true, false],
    ["past_due", false, true],
    ["incomplete", false, true],
    ["unpaid", false, true],
    ["canceled", false, false],
    ["incomplete_expired", false, false],
    [null, false, false],
  ])("%s → active %s, needs payment %s", (status, active, needsPayment) => {
    expect(hasActivePlan(me(status))).toBe(active);
    expect(subscriptionNeedsPayment(me(status))).toBe(needsPayment);
  });

  it("handles a missing me", () => {
    expect(hasActivePlan(null)).toBe(false);
    expect(subscriptionNeedsPayment(undefined)).toBe(false);
  });
});
