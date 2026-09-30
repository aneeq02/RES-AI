import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatThread from "./ChatThread";
import { api, streamChat } from "../../lib/api";
import { flush, render, type } from "../../test/dom";

vi.mock("../../lib/api", () => ({ api: vi.fn(), streamChat: vi.fn() }));
vi.mock("./TaskCard", () => ({ default: () => null }));

const AGENT = { name: "Buddy" };
const THREAD = { messages: [{ id: "m1", role: "assistant", content: [{ type: "text", text: "Hello" }] }], tasks: {}, deliverables: {} };

/** Controls one streamChat call: emit events, then finish or fail. */
function controlStream() {
  const ctl = {};
  vi.mocked(streamChat).mockImplementationOnce((_id, _text, onEvent) => new Promise((resolve, reject) => {
    Object.assign(ctl, { onEvent, resolve, reject });
  }));
  return {
    emit: (event, payload) => act(async () => { ctl.onEvent(event, payload); }),
    finish: () => act(async () => { ctl.resolve(); }),
    fail: (err) => act(async () => { ctl.reject(err); }),
  };
}

const mount = () => render(<MemoryRouter><ChatThread threadId="t1" agent={AGENT} canChat starter="Hi" /></MemoryRouter>);
const log = (c) => c.querySelector("[aria-busy]");
const status = (c) => c.querySelector('[role="status"]');
const alertText = (c) => c.querySelector('[role="alert"]')?.textContent;

async function sendMessage(container, text = "What does Asana charge?") {
  await type(container.querySelector("textarea"), text);
  await act(async () => { container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
}

beforeEach(() => {
  vi.mocked(api).mockReset().mockResolvedValue(THREAD);
  vi.mocked(streamChat).mockReset();
});

describe("ChatThread accessibility", () => {
  it("doesn't live-announce the scroll region, marks it busy while streaming, and announces the finished reply once", async () => {
    const stream = controlStream();
    const { container, unmount } = await mount();
    expect(log(container).hasAttribute("aria-live")).toBe(false);
    expect(container.querySelector("[aria-live]")).toBeNull();

    await sendMessage(container);
    expect(log(container).getAttribute("aria-busy")).toBe("true");
    await stream.emit("text", { delta: "Asana costs **$10.99**" });
    await stream.emit("text", { delta: " per user." });
    expect(status(container).textContent).toBe("");

    await stream.finish();
    expect(log(container).getAttribute("aria-busy")).toBe("false");
    expect(status(container).textContent).toBe("Buddy replied: Asana costs $10.99 per user.");
    unmount();
  });

  it("doesn't send on Enter while an IME composition is active", async () => {
    const { container, unmount } = await mount();
    const input = container.querySelector("textarea");
    await type(input, "こんにちは");
    await act(async () => { input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true })); });
    expect(streamChat).not.toHaveBeenCalled();

    controlStream();
    await act(async () => { input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
    expect(streamChat).toHaveBeenCalledTimes(1);
    unmount();
  });
});

describe("ChatThread send failures", () => {
  it("reloads the thread and explains a stream that drops mid-reply", async () => {
    const stream = controlStream();
    const { container, unmount } = await mount();
    await sendMessage(container);
    await stream.emit("text", { delta: "Partial" });
    api.mockClear();
    await stream.fail(new TypeError("network error"));
    expect(api).toHaveBeenCalledWith("/threads/t1/messages");
    expect(alertText(container)).toBe("Connection dropped. The reply may still be saving; refresh in a moment.");
    unmount();
  });

  it("says the message failed when nothing arrived", async () => {
    const stream = controlStream();
    const { container, unmount } = await mount();
    await sendMessage(container);
    await stream.fail(new TypeError("network error"));
    expect(alertText(container)).toBe("Message failed to send.");
    unmount();
  });
});

describe("ChatThread auto-scroll", () => {
  /** Gives the jsdom scroll region real-looking geometry. */
  function geometry(el, { scrollTop }) {
    Object.defineProperty(el, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(el, "clientHeight", { configurable: true, value: 400 });
    Object.defineProperty(el, "scrollTop", { configurable: true, writable: true, value: scrollTop });
    el.dispatchEvent(new Event("scroll"));
  }

  it("leaves the reader where they are when they've scrolled up", async () => {
    const stream = controlStream();
    const { container, unmount } = await mount();
    await sendMessage(container);
    geometry(log(container), { scrollTop: 100 });
    await stream.emit("text", { delta: "More" });
    expect(log(container).scrollTop).toBe(100);
    unmount();
  });

  it("follows the reply when the reader is within 80px of the bottom", async () => {
    const stream = controlStream();
    const { container, unmount } = await mount();
    await sendMessage(container);
    geometry(log(container), { scrollTop: 540 }); // 1000 - 540 - 400 = 60px from the bottom
    await stream.emit("text", { delta: "More" });
    expect(log(container).scrollTop).toBe(1000);
    await flush();
    unmount();
  });
});
