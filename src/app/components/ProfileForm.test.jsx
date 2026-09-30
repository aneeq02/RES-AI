import React, { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfileForm, { toForm } from "./ProfileForm";
import { api } from "../../lib/api";
import { button, click, render, type } from "../../test/dom";

vi.mock("../../lib/api", () => ({ api: vi.fn() }));

const initial = { ...toForm(null), company: "Acme", website: "acme.test" };
const submit = (container) => act(async () => {
  container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
});
const fieldByLabel = (container, text) => {
  const label = [...container.querySelectorAll("label")].find((l) => l.textContent === text);
  return document.getElementById(label.htmlFor);
};

beforeEach(() => { vi.mocked(api).mockReset(); });

describe("ProfileForm", () => {
  it("shows a form-level alert when saving fails", async () => {
    const onSubmit = vi.fn(() => Promise.reject(new Error("500")));
    const { container, unmount } = await render(<ProfileForm initial={initial} onSubmit={onSubmit} submitLabel="Save changes" />);
    await submit(container);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="alert"]').textContent).toContain("couldn't save your profile");
    expect(button(container, "Save changes").disabled).toBe(false);
    unmount();
  });

  it("caps each field at the server's limit", async () => {
    const { container, unmount } = await render(<ProfileForm initial={initial} onSubmit={vi.fn()} submitLabel="Save" />);
    const limits = {
      "Your name": 100, "Company name": 200, Website: 300, Industry: 200,
      "Who are your customers?": 1000, "Main competitors": 2000, "How should we sound?": 2000,
    };
    for (const [label, max] of Object.entries(limits)) expect(fieldByLabel(container, label).maxLength, label).toBe(max);
    unmount();
  });

  it.each([
    ["the hourly limit", { status: 429, body: { error: "rate_limited" } }, "You've used website fill a few times. Try again in an hour or fill it in by hand."],
    ["an unreadable site", { status: 422, body: { error: "Buddy couldn't read that website. Fill the profile in by hand." } }, "Buddy couldn't read that website. Fill the profile in by hand."],
    ["an error code", { status: 400, body: { error: "invalid" } }, "Couldn't read that website."],
  ])("explains a failed website fill: %s", async (_name, err, message) => {
    vi.mocked(api).mockRejectedValueOnce(err);
    const { container, unmount } = await render(<ProfileForm initial={initial} onSubmit={vi.fn()} submitLabel="Finish" stepped showDraft />);
    await click(button(container, "Fill from my website"));
    expect(container.querySelector('[role="alert"]').textContent).toBe(message);
    unmount();
  });

  it("moves focus to the step heading when the step changes, not on first render", async () => {
    const { container, unmount } = await render(<ProfileForm initial={initial} onSubmit={vi.fn()} submitLabel="Finish" stepped />);
    const heading = container.querySelector("h2");
    expect(heading.tabIndex).toBe(-1);
    expect(document.activeElement).not.toBe(heading);

    await submit(container);
    expect(heading.textContent).toContain("Step 2 of 3");
    expect(document.activeElement).toBe(heading);

    heading.blur();
    await click(button(container, "Back"));
    expect(heading.textContent).toContain("Step 1 of 3");
    expect(document.activeElement).toBe(heading);
    unmount();
  });

  it("still requires a company name before moving on", async () => {
    const { container, unmount } = await render(<ProfileForm initial={toForm(null)} onSubmit={vi.fn()} submitLabel="Finish" stepped />);
    await type(fieldByLabel(container, "Your name"), "Ada");
    await submit(container);
    expect(container.querySelector("h2").textContent).toContain("Step 1 of 3");
    expect(container.querySelector('[role="alert"]').textContent).toContain("Company name is required.");
    unmount();
  });
});
