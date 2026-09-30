import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const MeContext = createContext({ me: null, error: null, loading: false, refresh: async () => {} });

export function MeProvider({ children }) {
  const { session } = useAuth();
  const [state, setState] = useState({ me: null, error: null, loading: false });
  const userId = session?.user?.id;

  const refresh = useCallback(async () => {
    try {
      const me = await api("/me");
      setState({ me, error: null, loading: false });
      return me;
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setState({ me: null, error: null, loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    refresh();
  }, [userId, refresh]);

  const value = useMemo(() => ({ ...state, refresh }), [state, refresh]);
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMe = () => useContext(MeContext);
// eslint-disable-next-line react-refresh/only-export-components
export const hasActivePlan = (me) => ["active", "trialing"].includes(me?.subscription?.status);
