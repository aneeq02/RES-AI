import React from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Team from "./Team";
import { api } from "../../lib/api";
import { flush, render } from "../../test/dom";

const state = vi.hoisted(() => ({ me: null, refresh: null, params: null, setParams: null }));
vi.mock("../../context/MeContext", () => ({ useMe: () => ({ me: state.me, refresh: state.refresh }) }));
vi.mock("../../lib/api", () => ({ api: vi.fn() }));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useSearchParams: () => [state.params, state.setParams],
}));

const withStatus = (status) => ({ profile: { onboardedAt: "2026-09-01" }, subscription: status ? { status, planId: "1-month" } : null, agents: [] });
const renderTeam = () => render(<MemoryRouter><Team /></MemoryRouter>);

function returningFromStripe() {
  state.params = new URLSearchParams("checkout=success&session_id=cs_1");
  state.setParams = vi.fn();
}

/** A promise plus its resolve, to control when a request answers. */
function deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.mocked(api).mockReset();
  state.refresh = vi.fn(() => Promise.resolve(null));
  state.me = null;
  state.params = new URLSearchParams();
  state.setParams = vi.fn();
});

describe("Team after Stripe checkout", () => {
  it("says you're all set only when sync succeeds and the plan is active", async () => {
    returningFromStripe();
    state.me = withStatus(null);
    vi.mocked(api).mockResolvedValueOnce({ ok: true });
    state.refresh = vi.fn(() => Promise.resolve(withStatus("active")));
    const { container, unmount } = await renderTeam();
    await flush();
    expect(api).toHaveBeenCalledWith("/billing/sync", { method: "POST", body: { sessionId: "cs_1" } });
    expect(container.querySelector('[role="status"]').textContent).toContain("You're all set");
    expect(state.setParams).toHaveBeenCalledWith({}, { replace: true });
    unmount();
  });

  it("shows a neutral activating message when sync returns ok:false", async () => {
    returningFromStripe();
    vi.mocked(api).mockResolvedValueOnce({ ok: false });
    state.refresh = vi.fn();
    const { container, unmount } = await renderTeam();
    await flush();
    expect(container.querySelector('[role="status"]').textContent).toContain("Payment received, activating");
    expect(container.textContent).not.toContain("You're all set");
    unmount();
  });

  it("shows the activating message when sync succeeds but the plan isn't active yet", async () => {
    returningFromStripe();
    vi.mocked(api).mockResolvedValueOnce({ ok: true });
    state.refresh = vi.fn(() => Promise.resolve(withStatus("incomplete")));
    const { container, unmount } = await renderTeam();
    await flush();
    expect(container.querySelector('[role="status"]').textContent).toContain("Payment received, activating");
    unmount();
  });

  it("doesn't touch the URL after the page has unmounted", async () => {
    returningFromStripe();
    const sync = deferred();
    vi.mocked(api).mockReturnValueOnce(sync.promise);
    state.refresh = vi.fn(() => Promise.resolve(withStatus("active")));
    const { unmount } = await renderTeam();
    unmount();
    sync.resolve({ ok: true });
    await flush();
    expect(state.setParams).not.toHaveBeenCalled();
  });
});

describe("Team plan banner", () => {
  it("asks past_due subscribers to update their card instead of choosing a plan", async () => {
    state.me = withStatus("past_due");
    const { container, unmount } = await renderTeam();
    expect(container.textContent).toContain("Your last payment didn't go through.");
    expect(container.textContent).not.toContain("Choose a plan");
    unmount();
  });

  it("offers a plan to users without a subscription", async () => {
    state.me = withStatus(null);
    const { container, unmount } = await renderTeam();
    expect(container.textContent).toContain("Choose a plan");
    expect(container.textContent).not.toContain("payment didn't go through");
    unmount();
  });
});
