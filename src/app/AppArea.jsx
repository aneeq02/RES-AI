import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMe } from "../context/MeContext";
import { resolveGate } from "./gate";
import AppShell from "./AppShell";
import Team from "./pages/Team";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import AgentWorkspace from "./pages/AgentWorkspace";
import Deliverables from "./pages/Deliverables";
import DeliverableView from "./pages/DeliverableView";

function Center({ children }) {
  return <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center text-muted" role="status">{children}</div>;
}

export default function AppArea() {
  const { session, loading: authLoading } = useAuth();
  const { me, error, refresh } = useMe();
  const location = useLocation();
  const gate = resolveGate({ authLoading, session, me, meError: error, path: location.pathname + location.search });

  if (gate.state === "redirect") return <Navigate to={gate.to} replace />;
  if (gate.state === "loading") return <Center><LoaderCircle className="animate-spin" aria-label="Loading" /></Center>;
  if (gate.state === "error")
    return (
      <Center>
        <div>
          <p>We couldn't reach the res servers.</p>
          <button type="button" onClick={refresh} className="btn-secondary mt-4">Try again</button>
        </div>
      </Center>
    );

  return (
    <>
      <title>res workspace</title>
      <meta name="robots" content="noindex, nofollow" />
      <Routes>
        <Route path="onboarding" element={<Onboarding />} />
        <Route element={<AppShell />}>
          <Route index element={<Team />} />
          <Route path="agents/:id" element={<AgentWorkspace />} />
          <Route path="deliverables" element={<Deliverables />} />
          <Route path="deliverables/:id" element={<DeliverableView />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
    </>
  );
}
