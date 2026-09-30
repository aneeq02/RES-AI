// Every plan unlocks the full team; longer commitments lower the monthly price.
export const PLAN_FEATURES = [
  "All 12 AI specialists",
  "Brand voice training",
  "Gmail, Slack, Notion & HubSpot integrations",
  "Priority email support",
];

export const plans = [
  {
    id: "1-month",
    name: "1-month plan",
    months: 1,
    listPrice: 97,
    price: 48.5,
    save: 50,
    credits: 100,
  },
  {
    id: "12-month",
    name: "12-month plan",
    months: 12,
    listPrice: 52,
    price: 15.6,
    save: 70,
    popular: true,
    extras: ["Dedicated onboarding call", "Custom agent personalities"],
    credits: 200,
  },
  {
    id: "3-month",
    name: "3-month plan",
    months: 3,
    listPrice: 59,
    price: 23.6,
    save: 60,
    credits: 150,
  },
];

export const getPlan = (id) => plans.find((p) => p.id === id);

export const creditsLine = (plan) => `${plan.credits} task credits / month + unlimited chat`;

export const formatPrice = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: n % 1 ? 2 : 0 });
