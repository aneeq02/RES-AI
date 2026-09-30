/** Decides what an /app route should do given auth + profile state. `path` includes the query string. */
export function resolveGate({ authLoading, session, me, meError, path }) {
  if (authLoading) return { state: "loading" };
  if (!session) return { state: "redirect", to: `/login?next=${encodeURIComponent(path)}` };
  // A failed background refresh keeps the profile we already have; only a missing profile is fatal.
  if (!me) return meError ? { state: "error" } : { state: "loading" };
  const onOnboarding = path.startsWith("/app/onboarding");
  if (!me.profile.onboardedAt && !onOnboarding) {
    // Plain /app has nowhere specific to return to, so let onboarding choose (e.g. /checkout without a plan).
    const home = path === "/app" || path === "/app/";
    return { state: "redirect", to: home ? "/app/onboarding" : `/app/onboarding?next=${encodeURIComponent(path)}` };
  }
  return { state: "ok" };
}
