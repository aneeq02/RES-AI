import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

const AuthContext = createContext({ session: null, loading: true });

export function AuthProvider({ children }) {
  // No Supabase config (e.g. env unset) means there's nothing to wait on: start settled.
  // Depends only on build-time env, so SSR and the first client render agree.
  const [state, setState] = useState(() => (supabaseConfigured ? { session: null, loading: true } : { session: null, loading: false }));

  useEffect(() => {
    if (!supabaseConfigured) return;
    let cancelled = false;
    let subscription = null;
    getSupabase()
      .then((supabase) => {
        if (cancelled || !supabase) return;
        supabase.auth.getSession().then(({ data }) => { if (!cancelled) setState({ session: data.session, loading: false }); });
        subscription = supabase.auth.onAuthStateChange((_event, session) => { if (!cancelled) setState({ session, loading: false }); }).data.subscription;
      })
      .catch(() => { if (!cancelled) setState({ session: null, loading: false }); });
    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
