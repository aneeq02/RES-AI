import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({ session: null, loading: true });

export function AuthProvider({ children }) {
  // No Supabase client (e.g. env unset) means there's nothing to wait on: start settled.
  const [state, setState] = useState(() => (supabase ? { session: null, loading: true } : { session: null, loading: false }));

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setState({ session: data.session, loading: false }));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState({ session, loading: false }));
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
