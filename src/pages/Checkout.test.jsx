import React from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Checkout from "./Checkout";
import { button, click, render } from "../test/dom";

const state = vi.hoisted(() => ({ me: null, error: null, refresh: null }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ session: { user: { id: "a" } }, loading: false }) }));
vi.mock("../context/MeContext", () => ({ useMe: () => state }));
vi.mock("../lib/api", () => ({ api: vi.fn() }));

const onboarded = (subscription) => ({ profile: { onboardedAt: "2026-09-01" }, subscription });
const renderCheckout = () => render(<MemoryRouter initialEntries={["/checkout"]}><Checkout /></MemoryRouter>);

afterEach(() => { state.me = null; state.error = null; state.refresh = null; });

describe("Checkout", () => {
  it("explains a failed /me load and retries it instead of leaving pay disabled", async () => {
    state.error = new Error("offline");
    state.refresh = vi.fn(() => Promise.resolve(null));
    const { container, unmount } = await renderCheckout();
    expect(container.querySelector('[role="alert"]').textContent).toContain("couldn't load your account");
    expect(button(container, "Continue to payment")).toBeUndefined();
    await click(button(container, "Retry"));
    expect(state.refresh).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("sends past_due subscribers to update their card, not to a second checkout", async () => {
    state.me = onboarded({ status: "past_due", planId: "1-month" });
    const { container, unmount } = await renderCheckout();
    expect(container.textContent).toContain("Your last payment didn't go through.");
    expect(button(container, "Update payment method")).toBeDefined();
    expect(button(container, "Continue to payment")).toBeUndefined();
    unmount();
  });

  it("shows the order form to a user without a subscription", async () => {
    state.me = onboarded(null);
    const { container, unmount } = await renderCheckout();
    expect(button(container, "Continue to payment")).toBeDefined();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    unmount();
  });
});
