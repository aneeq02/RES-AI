import React, { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MeProvider, useMe } from "./MeContext";
import { api } from "../lib/api";

const auth = vi.hoisted(() => ({ session: null }));
vi.mock("./AuthContext", () => ({ useAuth: () => ({ session: auth.session, loading: false }) }));
vi.mock("../lib/api", () => ({ api: vi.fn() }));

const ME_A = { user: { id: "a" }, profile: { onboardedAt: "2026-09-01" } };
const ME_B = { user: { id: "b" }, profile: { onboardedAt: "2026-09-01" } };

let root;
let container;
let latest;

function Consumer() {
  const me = useMe();
  useEffect(() => { latest = me; });
  return null;
}

async function render(children) {
  await act(async () => { root.render(<MeProvider>{children}</MeProvider>); });
}

/** A promise plus its resolve/reject, to control when /me answers. */
function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

beforeEach(() => {
  auth.session = { user: { id: "a" } };
  latest = null;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.mocked(api).mockReset();
});

describe("MeProvider", () => {
  it("doesn't call /me when no component asks for it (marketing pages)", async () => {
    vi.mocked(api).mockResolvedValue(ME_A);
    await render(<p>marketing</p>);
    expect(api).not.toHaveBeenCalled();
  });

  it("fetches /me once a component calls useMe()", async () => {
    vi.mocked(api).mockResolvedValue(ME_A);
    await render(<><Consumer /><Consumer /></>);
    expect(api).toHaveBeenCalledTimes(1);
    expect(api).toHaveBeenCalledWith("/me");
    expect(latest.me).toEqual(ME_A);
    expect(latest.error).toBeNull();
  });

  it("doesn't fetch for a signed-out visitor", async () => {
    auth.session = null;
    vi.mocked(api).mockResolvedValue(ME_A);
    await render(<Consumer />);
    expect(api).not.toHaveBeenCalled();
    expect(latest.me).toBeNull();
  });

  it("keeps me and reports no error when a background refresh fails", async () => {
    vi.mocked(api).mockResolvedValueOnce(ME_A);
    await render(<Consumer />);
    vi.mocked(api).mockRejectedValueOnce(new Error("offline"));
    await act(async () => { await latest.refresh(); });
    expect(latest.me).toEqual(ME_A);
    expect(latest.error).toBeNull();
  });

  it("reports the error when there's no me, and clears it after a successful retry", async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error("offline"));
    await render(<Consumer />);
    expect(latest.me).toBeNull();
    expect(latest.error).toBeInstanceOf(Error);

    vi.mocked(api).mockResolvedValueOnce(ME_A);
    await act(async () => { await latest.refresh(); });
    expect(latest.me).toEqual(ME_A);
    expect(latest.error).toBeNull();
  });

  it("ignores a /me response that arrives after the signed-in user changed", async () => {
    const first = deferred();
    vi.mocked(api).mockReturnValueOnce(first.promise).mockResolvedValueOnce(ME_B);
    await render(<Consumer />);

    auth.session = { user: { id: "b" } };
    await render(<Consumer />);
    expect(latest.me).toEqual(ME_B);

    await act(async () => { first.resolve(ME_A); await first.promise; });
    expect(latest.me).toEqual(ME_B);
  });

  it("drops the previous user's me on sign-out", async () => {
    vi.mocked(api).mockResolvedValueOnce(ME_A);
    await render(<Consumer />);
    auth.session = null;
    await render(<Consumer />);
    expect(latest.me).toBeNull();
  });
});
