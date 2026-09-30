import React from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskCard from "./TaskCard";
import { api } from "../../lib/api";
import { button, click, flush, render } from "../../test/dom";

const state = vi.hoisted(() => ({ task: null, refreshMe: null }));
vi.mock("../../lib/api", () => ({ api: vi.fn() }));
vi.mock("../../context/MeContext", () => ({ useMe: () => ({ me: { credits: { balance: 10 } }, refresh: state.refreshMe }) }));
vi.mock("../hooks/useTaskLive", () => ({
  default: () => ({ task: state.task, events: [], deliverable: null, refresh: vi.fn(() => Promise.resolve()), setTask: vi.fn() }),
}));

const task = (status, extra = {}) => ({ id: "t1", label: "Quick research", credits: 1, status, brief: { summary: "Asana pricing", details: "" }, ...extra });
const card = (props = {}) => <MemoryRouter><TaskCard initialTask={state.task} canStart {...props} /></MemoryRouter>;

/** A promise plus its resolve/reject, to control when a request answers. */
function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.mocked(api).mockReset();
  state.refreshMe = vi.fn();
});

describe("TaskCard failed tasks", () => {
  it("shows a historical failure as plain text, not an alert", async () => {
    state.task = task("failed", { error: "The sources were unreachable." });
    const { container, unmount } = await render(card());
    expect(container.textContent).toContain("The sources were unreachable.");
    expect(container.querySelector('[role="alert"]')).toBeNull();
    unmount();
  });

  it("ignores repeat clicks while a retry is in flight", async () => {
    state.task = task("failed", { error: "x" });
    const req = deferred();
    vi.mocked(api).mockReturnValueOnce(req.promise);
    const onRetried = vi.fn();
    const { container, unmount } = await render(card({ onRetried }));
    await click(button(container, "Retry"));
    expect(button(container, "Retry").disabled).toBe(true);
    await click(button(container, "Retry"));
    expect(api).toHaveBeenCalledTimes(1);
    req.resolve({ task: { id: "t2" } });
    await flush();
    expect(onRetried).toHaveBeenCalledWith({ id: "t2" });
    unmount();
  });

  it("alerts when the retry itself fails", async () => {
    state.task = task("failed", { error: "x" });
    vi.mocked(api).mockRejectedValueOnce(new Error("offline"));
    const { container, unmount } = await render(card());
    await click(button(container, "Retry"));
    expect(container.querySelector('[role="alert"]').textContent).toBe("Couldn't retry the task. Please try again.");
    expect(button(container, "Retry").disabled).toBe(false);
    unmount();
  });
});

describe("TaskCard credits", () => {
  it("refreshes /me when a watched task finishes", async () => {
    state.task = task("running");
    const { rerender, unmount } = await render(card());
    expect(state.refreshMe).not.toHaveBeenCalled();
    state.task = task("done");
    await rerender(card());
    expect(state.refreshMe).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("refreshes /me when a watched task fails (credits refunded)", async () => {
    state.task = task("queued");
    const { rerender, unmount } = await render(card());
    state.task = task("failed", { error: "x" });
    await rerender(card());
    expect(state.refreshMe).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("doesn't refresh /me for a task that was already done when shown", async () => {
    state.task = task("done");
    const { rerender, unmount } = await render(card());
    await rerender(card());
    expect(state.refreshMe).not.toHaveBeenCalled();
    unmount();
  });
});
