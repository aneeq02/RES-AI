import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import useTaskLive from "./useTaskLive";

vi.mock("../../lib/api", () => ({ api: vi.fn(() => Promise.resolve({ task: { status: "running" }, events: [], deliverable: null })) }));

const channelNames = [];
function makeFakeChannel() {
  const chain = {
    on: () => chain,
    subscribe: () => chain,
  };
  return chain;
}
vi.mock("../../lib/supabase", () => ({
  supabase: {
    channel: (name) => { channelNames.push(name); return makeFakeChannel(); },
    removeChannel: vi.fn(),
  },
}));

/** Mounts a component calling the hook and returns an unmount function. */
function mountHook(taskId, initialTask, { strict = false } = {}) {
  let container;
  function Harness() {
    useTaskLive(taskId, initialTask);
    return null;
  }
  const tree = strict ? <React.StrictMode><Harness /></React.StrictMode> : <Harness />;
  act(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    container.__root = root;
    root.render(tree);
  });
  return () => {
    act(() => { container.__root.unmount(); });
    container.remove();
  };
}

describe("useTaskLive realtime channel topic", () => {
  afterEach(() => { channelNames.length = 0; });

  it("gives two hook instances for the same active task distinct channel topics", () => {
    const task = { id: "t1", status: "running" };
    const unmountA = mountHook("t1", task);
    const unmountB = mountHook("t1", task);

    expect(channelNames.length).toBe(2);
    expect(channelNames[0]).not.toBe(channelNames[1]);
    expect(channelNames[0]).toMatch(/^task-t1-/);
    expect(channelNames[1]).toMatch(/^task-t1-/);

    unmountA();
    unmountB();
  });

  it("gives a remounted instance a fresh topic distinct from the one that left", () => {
    const task = { id: "t2", status: "running" };
    const unmountFirst = mountHook("t2", task);
    const firstTopic = channelNames[0];
    unmountFirst();

    const unmountSecond = mountHook("t2", task);
    const secondTopic = channelNames[1];
    unmountSecond();

    expect(secondTopic).not.toBe(firstTopic);
  });

  it("does not reuse the topic across StrictMode's own effect cleanup + re-run on one instance", () => {
    const task = { id: "t3", status: "running" };
    const unmount = mountHook("t3", task, { strict: true });

    // React 19 StrictMode (dev) mounts, runs effects, cleans them up, and re-runs them once —
    // all synchronously within this one mountHook() call, on what is logically a single
    // component instance. A topic that doesn't vary per effect run (e.g. one derived from
    // useId(), which is stable for the life of the instance) would be recorded twice here.
    const t3Topics = channelNames.filter((n) => n.startsWith("task-t3-"));
    expect(t3Topics.length).toBe(2);
    expect(new Set(t3Topics).size).toBe(2);

    unmount();
  });
});
