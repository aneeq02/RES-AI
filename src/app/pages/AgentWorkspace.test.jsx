import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AgentWorkspace from "./AgentWorkspace";
import { api } from "../../lib/api";
import { render } from "../../test/dom";

const state = vi.hoisted(() => ({ me: null }));
vi.mock("../../context/MeContext", () => ({ useMe: () => ({ me: state.me, refresh: vi.fn() }) }));
vi.mock("../../lib/api", () => ({ api: vi.fn() }));
vi.mock("../components/ChatThread", () => ({
  default: ({ threadId, canChat, lockedPlaceholder }) => (
    <p data-testid="chat" data-thread={threadId} data-can-chat={String(canChat)}>{lockedPlaceholder}</p>
  ),
}));

const A = "0b6f3a52-6d0e-4a8e-9b1f-2c3d4e5f6a7b";
const B = "1c7a4b63-7e1f-4b9f-8c2a-3d4e5f6a7b8c";
const me = (status) => ({ agents: [{ id: "buddy" }], subscription: status ? { status, planId: "1-month" } : null });

const renderAt = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes><Route path="/app/agents/:id" element={<AgentWorkspace />} /></Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.me = me("active");
  vi.mocked(api).mockReset();
  vi.mocked(api).mockImplementation(async (path) => (path.startsWith("/threads?") ? { threads: [{ id: A, title: "a" }, { id: B, title: "b" }] } : {}));
});

describe("AgentWorkspace ?thread=", () => {
  it("opens a requested thread that belongs to this agent", async () => {
    const { container, unmount } = await renderAt(`/app/agents/buddy?thread=${B}`);
    expect(container.querySelector('[data-testid="chat"]').dataset.thread).toBe(B);
    unmount();
  });

  it("falls back to the first thread for a thread id that isn't in the list", async () => {
    const { container, unmount } = await renderAt("/app/agents/buddy?thread=2d8b5c74-8f2a-4c0a-9d3b-4e5f6a7b8c9d");
    expect(container.querySelector('[data-testid="chat"]').dataset.thread).toBe(A);
    unmount();
  });

  it("falls back to the first thread for a non-UUID value", async () => {
    const { container, unmount } = await renderAt("/app/agents/buddy?thread=..%2F..%2Fbilling");
    expect(container.querySelector('[data-testid="chat"]').dataset.thread).toBe(A);
    unmount();
  });
});

describe("AgentWorkspace plan banner", () => {
  it("asks past_due subscribers to update their card, not to choose a plan", async () => {
    state.me = me("past_due");
    const { container, unmount } = await renderAt("/app/agents/buddy");
    expect(container.textContent).toContain("Your last payment didn't go through.");
    expect(container.textContent).not.toContain("Choose a plan");
    const chat = container.querySelector('[data-testid="chat"]');
    expect(chat.dataset.canChat).toBe("false");
    expect(chat.textContent).toContain("Update your payment method");
    unmount();
  });

  it("offers a plan to users without a subscription", async () => {
    state.me = me(null);
    const { container, unmount } = await renderAt("/app/agents/buddy");
    expect(container.textContent).toContain("Choose a plan");
    expect(container.textContent).not.toContain("payment didn't go through");
    unmount();
  });
});
