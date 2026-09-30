/** Decides what an /app route should do given auth + profile state. `path` includes the query string. */
export function resolveGate({ authLoading, session, me, meError, path }) {
  if (authLoading) return { state: "loading" };
  if (!session) return { state: "redirect", to: `/login?next=${encodeURIComponent(path)}` };
  if (meError) return { state: "error" };
  if (!me) return { state: "loading" };
  const onOnboarding = path.startsWith("/app/onboarding");
  if (!me.profile.onboardedAt && !onOnboarding) return { state: "redirect", to: `/app/onboarding?next=${encodeURIComponent(path)}` };
  return { state: "ok" };
}
