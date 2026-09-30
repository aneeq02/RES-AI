import React from "react";
import { describe, expect, it, vi } from "vitest";
import PaymentIssueNotice from "./PaymentIssueNotice";
import { openBillingPortal } from "../../lib/billing";
import { api } from "../../lib/api";
import { button, click, render } from "../../test/dom";

vi.mock("../../lib/api", () => ({ api: vi.fn() }));

describe("openBillingPortal", () => {
  it("POSTs /billing/portal and goes to the returned URL", async () => {
    vi.mocked(api).mockResolvedValueOnce({ url: "https://billing.stripe.test/p" });
    const assign = vi.fn();
    await openBillingPortal(assign);
    expect(api).toHaveBeenCalledWith("/billing/portal", { method: "POST" });
    expect(assign).toHaveBeenCalledWith("https://billing.stripe.test/p");
  });
});

describe("PaymentIssueNotice", () => {
  it("tells the user their payment failed and opens the portal", async () => {
    const openPortal = vi.fn(() => Promise.resolve());
    const { container, unmount } = await render(<PaymentIssueNotice openPortal={openPortal} />);
    expect(container.textContent).toContain("Your last payment didn't go through.");
    await click(button(container, "Update payment method"));
    expect(openPortal).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("shows an alert when the portal can't be opened", async () => {
    const openPortal = vi.fn(() => Promise.reject(new Error("no_customer")));
    const { container, unmount } = await render(<PaymentIssueNotice openPortal={openPortal} />);
    await click(button(container, "Update payment method"));
    expect(container.querySelector('[role="alert"]').textContent).toContain("couldn't open billing");
    expect(button(container, "Update payment method").disabled).toBe(false);
    unmount();
  });
});
