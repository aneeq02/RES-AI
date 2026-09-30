import { describe, expect, it } from "vitest";
import { createSseParser } from "./sse";

describe("createSseParser", () => {
  it("parses events split across chunks", () => {
    const got = [];
    const p = createSseParser((event, data) => got.push([event, data]));
    p.push('event: text\ndata: {"delta":"He');
    p.push('llo"}\n\nevent: done\r\ndata: {"messageId":"m1"}\r\n\r\n');
    expect(got).toEqual([["text", { delta: "Hello" }], ["done", { messageId: "m1" }]]);
  });

  it("ignores comments and keep-alives", () => {
    const got = [];
    const p = createSseParser((e, d) => got.push([e, d]));
    p.push(": ping\n\n");
    expect(got).toEqual([]);
  });
});
