import { describe, expect, it } from "vitest";
import { draftErrorMessage } from "./draftError";

describe("draftErrorMessage", () => {
  it("explains the hourly limit on 429", () => {
    expect(draftErrorMessage({ status: 429, body: { error: "rate_limited" } })).toBe(
      "You've used website fill a few times. Try again in an hour or fill it in by hand.",
    );
  });
  it("passes through a human-readable server message", () => {
    const error = "Buddy couldn't read that website. Fill the profile in by hand.";
    expect(draftErrorMessage({ status: 422, body: { error } })).toBe(error);
  });
  it.each([
    ["an error code", { status: 400, body: { error: "invalid" } }],
    ["no body", { status: 500, body: null }],
    ["a network error", new TypeError("Failed to fetch")],
    ["nothing", undefined],
  ])("falls back for %s", (_name, err) => {
    expect(draftErrorMessage(err)).toBe("Couldn't read that website.");
  });
});
