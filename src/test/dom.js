import { act } from "react";
import { createRoot } from "react-dom/client";

/** Renders into a fresh container (react-dom/client + act, no testing-library). */
export async function render(ui) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => { root.render(ui); });
  return {
    container,
    rerender: (next) => act(async () => { root.render(next); }),
    unmount: () => {
      act(() => { root.unmount(); });
      container.remove();
    },
  };
}

/** Clicks an element and lets the resulting updates and promises settle. */
export const click = (el) => act(async () => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });

/** Sets a controlled input/textarea's value the way React notices (native setter + input event). */
export function type(el, value) {
  const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  return act(async () => {
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/** Lets pending promises (and the state updates they trigger) settle. */
export const flush = () => act(async () => {});

/** Finds a button by its visible text. */
export const button = (root, text) => [...root.querySelectorAll("button")].find((b) => b.textContent.includes(text));
