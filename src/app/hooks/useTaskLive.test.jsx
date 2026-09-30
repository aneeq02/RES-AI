import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import useTaskLive from "./useTaskLive";

vi.mock("../../lib/api", () => ({ api: vi.fn(() => Promise.resolve({ task: { status: "running" }, events: [], deliverable: null })) }));

const { channelNames, removeChannel } = vi.hoisted(() => ({ channelNames: [], removeChannel: vi.fn() }));
function makeFakeChannel(name) {
  const chain = {
    name,
    on: () => chain,
    subscribe: () => chain,
  };
  return chain;
}
vi.mock("../../lib/supabase", () => {
  const client = {
    channel: (name) => { channelNames.push(name); return makeFakeChannel(name); },
    removeChannel,
  };
  return { supabaseConfigured: true, getSupabase: async () => client };
});

/** Mounts a component calling the hook (letting the lazy client resolve) and returns an unmount function. */
async function mountHook(taskId, initialTask, { strict = false } = {}) {
  let container;
  function Harness() {
    useTaskLive(taskId, initialTask);
    return null;
  }
  const tree = strict ? <React.StrictMode><Harness /></React.StrictMode> : <Harness />;
  await act(async () => {
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
  afterEach(() => { channelNames.length = 0; removeChannel.mockClear(); });

  it("gives two hook instances for the same active task distinct channel topics", async () => {
    const task = { id: "t1", status: "running" };
    const unmountA = await mountHook("t1", task);
    const unmountB = await mountHook("t1", task);

    expect(channelNames.length).toBe(2);
    expect(channelNames[0]).not.toBe(channelNames[1]);
    expect(channelNames[0]).toMatch(/^task-t1-/);
    expect(channelNames[1]).toMatch(/^task-t1-/);

    unmountA();
    unmountB();
  });

  it("gives a remounted instance a fresh topic distinct from the one that left", async () => {
    const task = { id: "t2", status: "running" };
    const unmountFirst = await mountHook("t2", task);
    const firstTopic = channelNames[0];
    unmountFirst();

    const unmountSecond = await mountHook("t2", task);
    const secondTopic = channelNames[1];
    unmountSecond();

    expect(secondTopic).not.toBe(firstTopic);
  });

  it("removes its channel on unmount", async () => {
    const unmount = await mountHook("t4", { id: "t4", status: "running" });
    expect(removeChannel).not.toHaveBeenCalled();
    unmount();
    expect(removeChannel).toHaveBeenCalledTimes(1);
    expect(removeChannel.mock.calls[0][0].name).toBe(channelNames[0]);
  });

  it("subscribes once under StrictMode: the cleaned-up first effect run never opens a channel", async () => {
    const task = { id: "t3", status: "running" };
    const unmount = await mountHook("t3", task, { strict: true });

    // React 19 StrictMode (dev) mounts, runs effects, cleans them up, and re-runs them once.
    // The client loads asynchronously, so the first run is cancelled before it can subscribe.
    const t3Topics = channelNames.filter((n) => n.startsWith("task-t3-"));
    expect(t3Topics.length).toBe(1);

    unmount();
    expect(removeChannel).toHaveBeenCalledTimes(1);
  });
});
