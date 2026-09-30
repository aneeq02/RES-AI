import { api } from "./api";

/** Opens the Stripe billing portal (update card, see invoices, cancel). Throws if it can't be opened. */
export async function openBillingPortal(assign = (url) => window.location.assign(url)) {
  const { url } = await api("/billing/portal", { method: "POST" });
  assign(url);
}
