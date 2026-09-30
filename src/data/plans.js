// Every plan includes each specialist as they launch; longer commitments lower the monthly price.
// Only list what a subscriber gets today ("Brand voice training" is the business profile).
export const PLAN_FEATURES = [
  "The full AI team as each specialist launches (Buddy is live now)",
  "Brand voice training",
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
    extras: ["Dedicated onboarding call"],
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
