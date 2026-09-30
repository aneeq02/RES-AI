import { describe, expect, it } from "vitest";
import { PLANS, planAmountCents } from "../src/plans.js";
import { creditPeriod } from "../src/period.js";
// @ts-expect-error: plain JS module from the frontend
import { plans as sitePlans } from "../../src/data/plans.js";

describe("plans", () => {
  it("matches the plans shown on the website", () => {
    for (const p of sitePlans as any[]) {
      expect(PLANS[p.id as keyof typeof PLANS]).toMatchObject({ months: p.months, monthlyPrice: p.price, credits: p.credits });
    }
    expect(Object.keys(PLANS).sort()).toEqual((sitePlans as any[]).map((p) => p.id).sort());
  });

  it("charges the whole term up front in cents", () => {
    expect(planAmountCents("12-month")).toBe(18720);
    expect(planAmountCents("1-month")).toBe(4850);
  });
});

describe("creditPeriod", () => {
  const start = new Date("2026-01-31T10:00:00Z");
  it("is period 0 on the start date", () => {
    expect(creditPeriod(start, start)).toEqual({ index: 0, start, end: new Date("2026-02-28T10:00:00Z") });
  });
  it("clamps to the end of shorter months and advances monthly", () => {
    const p = creditPeriod(start, new Date("2026-03-01T00:00:00Z"));
    expect(p.index).toBe(1);
    expect(p.start).toEqual(new Date("2026-02-28T10:00:00Z"));
    expect(p.end).toEqual(new Date("2026-03-31T10:00:00Z"));
  });
  it("counts whole months across a year", () => {
    expect(creditPeriod(start, new Date("2027-01-31T10:00:00Z")).index).toBe(12);
  });
});
