import { describe, expect, it } from "vitest";
import { taskStartErrorMessage } from "./taskStartError";

describe("taskStartErrorMessage", () => {
  it("flags insufficient credits", () => {
    expect(taskStartErrorMessage({ status: 402, body: { error: "insufficient_credits" } })).toBe("Not enough credits.");
  });
  it("tells the user credits were refunded when enqueue failed", () => {
    expect(taskStartErrorMessage({ status: 503, body: { error: "enqueue_failed" } })).toBe(
      "Buddy couldn't queue this task. Your credits were refunded.",
    );
  });
  it("flags a task already started", () => {
    expect(taskStartErrorMessage({ status: 409, body: {} })).toBe("This task was already started.");
  });
  it("falls back to a generic message", () => {
    expect(taskStartErrorMessage({ status: 500, body: {} })).toBe("Couldn't start the task.");
    expect(taskStartErrorMessage(undefined)).toBe("Couldn't start the task.");
  });
});
