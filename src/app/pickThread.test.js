import { describe, expect, it } from "vitest";
import { pickThread } from "./pickThread";

const A = "0b6f3a52-6d0e-4a8e-9b1f-2c3d4e5f6a7b";
const B = "1c7a4b63-7e1f-4b9f-8c2a-3d4e5f6a7b8c";
const threads = [{ id: A }, { id: B }];

describe("pickThread", () => {
  it("opens the requested thread when it's in the list", () => {
    expect(pickThread(B, threads)).toBe(B);
  });
  it("falls back to the first thread when none is requested", () => {
    expect(pickThread(null, threads)).toBe(A);
  });
  it("ignores a UUID that isn't one of this agent's threads", () => {
    expect(pickThread("2d8b5c74-8f2a-4c0a-9d3b-4e5f6a7b8c9d", threads)).toBe(A);
  });
  it("ignores a value that isn't a UUID", () => {
    expect(pickThread("../../billing", [...threads, { id: "../../billing" }])).toBe(A);
  });
  it("returns undefined while threads are still loading", () => {
    expect(pickThread(B, [])).toBeUndefined();
  });
});
