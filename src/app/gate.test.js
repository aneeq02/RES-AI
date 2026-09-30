import { describe, expect, it } from "vitest";
import { resolveGate } from "./gate";

const me = (onboardedAt) => ({ profile: { onboardedAt } });

describe("resolveGate", () => {
  it("waits for auth", () => {
    expect(resolveGate({ authLoading: true, path: "/app" })).toEqual({ state: "loading" });
  });
  it("sends signed-out users to login and brings them back", () => {
    expect(resolveGate({ authLoading: false, session: null, path: "/app/agents/buddy" })).toEqual({
      state: "redirect",
      to: "/login?next=%2Fapp%2Fagents%2Fbuddy",
    });
  });
  it("sends users who haven't onboarded to onboarding, keeping where they were going", () => {
    expect(resolveGate({ authLoading: false, session: {}, me: me(null), path: "/app/agents/buddy" })).toEqual({
      state: "redirect",
      to: "/app/onboarding?next=%2Fapp%2Fagents%2Fbuddy",
    });
  });
  it("lets onboarding render itself", () => {
    expect(resolveGate({ authLoading: false, session: {}, me: me(null), path: "/app/onboarding" })).toEqual({ state: "ok" });
  });
  it("lets onboarded users in", () => {
    expect(resolveGate({ authLoading: false, session: {}, me: me("2026-09-01"), path: "/app" })).toEqual({ state: "ok" });
  });
  it("reports API errors when there's no profile to show", () => {
    expect(resolveGate({ authLoading: false, session: {}, meError: new Error("x"), path: "/app" })).toEqual({ state: "error" });
  });
  it("keeps the app up when a background refresh fails but the profile is already loaded", () => {
    expect(resolveGate({ authLoading: false, session: {}, me: me("2026-09-01"), meError: new Error("x"), path: "/app" })).toEqual({ state: "ok" });
  });
  it("omits next for the /app home so onboarding picks its own default", () => {
    expect(resolveGate({ authLoading: false, session: {}, me: me(null), path: "/app" })).toEqual({ state: "redirect", to: "/app/onboarding" });
  });
  it("keeps next for /app with a query string (e.g. returning from Stripe)", () => {
    expect(resolveGate({ authLoading: false, session: {}, me: me(null), path: "/app?checkout=success" })).toEqual({
      state: "redirect",
      to: "/app/onboarding?next=%2Fapp%3Fcheckout%3Dsuccess",
    });
  });
});
