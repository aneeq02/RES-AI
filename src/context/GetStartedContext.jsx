import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import GetStartedModal from "../components/modals/GetStartedModal";

const GetStartedContext = createContext({ open: () => {}, close: () => {} });

export function GetStartedProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <GetStartedContext.Provider value={value}>
      {children}
      <GetStartedModal isOpen={isOpen} onClose={close} />
    </GetStartedContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGetStarted = () => useContext(GetStartedContext);
