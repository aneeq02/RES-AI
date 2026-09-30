import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const MeContext = createContext({ me: null, error: null, loading: false, refresh: async () => null, ensure: () => {} });

/**
 * The signed-in user's /me, fetched lazily: nothing is requested until a component calls useMe(),
 * so marketing pages that never ask cost no API call.
 */
export function MeProvider({ children }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [wanted, setWanted] = useState(false);
  // Results are tagged with the user they belong to, so a sign-out or user switch hides them at once.
  const [result, setResult] = useState({ userId: null, me: null, error: null });
  const currentUser = useRef(userId);

  useEffect(() => { currentUser.current = userId; }, [userId]);

  const load = useCallback(async (uid) => {
    try {
      const me = await api("/me");
      // The user changed while this was in flight: it answers for someone else.
      if (currentUser.current === uid) setResult({ userId: uid, me, error: null });
      return me;
    } catch (error) {
      if (currentUser.current === uid) {
        // Keep the /me we already have after a failed background refresh; surface the error only when there's nothing to show.
        setResult((r) => (r.userId === uid && r.me ? r : { userId: uid, me: null, error }));
      }
      return null;
    }
  }, []);

  useEffect(() => {
    if (wanted && userId) load(userId);
  }, [wanted, userId, load]);

  const refresh = useCallback(() => (currentUser.current ? load(currentUser.current) : Promise.resolve(null)), [load]);
  const ensure = useCallback(() => setWanted(true), []);

  const own = userId && result.userId === userId ? result : { me: null, error: null };
  const loading = Boolean(wanted && userId && !own.me && !own.error);
  const value = useMemo(() => ({ me: own.me, error: own.error, loading, refresh, ensure }), [own.me, own.error, loading, refresh, ensure]);
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

/** Reads /me, starting the fetch on first use. */
// eslint-disable-next-line react-refresh/only-export-components
export function useMe() {
  const ctx = useContext(MeContext);
  const { ensure } = ctx;
  useEffect(() => { ensure(); }, [ensure]);
  return ctx;
}
