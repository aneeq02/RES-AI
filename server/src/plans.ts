// Mirrors src/data/plans.js (test/plans.test.ts keeps them in sync).
export const PLANS = {
  "1-month": { name: "1-month plan", months: 1, monthlyPrice: 48.5, credits: 100 },
  "3-month": { name: "3-month plan", months: 3, monthlyPrice: 23.6, credits: 150 },
  "12-month": { name: "12-month plan", months: 12, monthlyPrice: 15.6, credits: 200 },
} as const;

export type PlanId = keyof typeof PLANS;

export const isPlanId = (x: unknown): x is PlanId => typeof x === "string" && x in PLANS;
export const planAmountCents = (id: PlanId) => Math.round(PLANS[id].monthlyPrice * PLANS[id].months * 100);
export const lookupKey = (id: PlanId) => `res_${id}`;
