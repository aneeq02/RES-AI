import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";

// Rendered with no Auth/Me providers: the sign-in entry point must not depend on auth state.
vi.mock("../../context/AuthContext", () => ({ useAuth: () => { throw new Error("Navbar must not read auth"); } }));
vi.mock("../../context/MeContext", () => ({ useMe: () => { throw new Error("Navbar must not read /me"); } }));

describe("Sign in link", () => {
  it("is a static link to /login in the desktop navbar", () => {
    const html = renderToString(<MemoryRouter initialEntries={["/pricing"]}><Navbar /></MemoryRouter>);
    expect(html).toMatch(/<a[^>]*href="\/login"[^>]*>Sign in<\/a>/);
  });

  it("is in the mobile menu", () => {
    const html = renderToString(<MemoryRouter initialEntries={["/pricing"]}><MobileMenu isOpen onClose={() => {}} onOpenGetStarted={() => {}} /></MemoryRouter>);
    expect(html).toMatch(/<a[^>]*href="\/login"[^>]*>Sign in<\/a>/);
  });
});
