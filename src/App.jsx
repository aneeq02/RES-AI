import React from "react";
import { MotionConfig } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";
import { GetStartedProvider } from "./context/GetStartedContext";
import { AuthProvider } from "./context/AuthContext";
import { MeProvider } from "./context/MeContext";

// Router-agnostic app shell: main.jsx wraps it in BrowserRouter,
// entry-server.jsx in StaticRouter for prerendering.
export default function App() {
  return (
    // Honour the OS "reduce motion" setting for every framer-motion animation
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <MeProvider>
          <GetStartedProvider>
            <AppRoutes />
          </GetStartedProvider>
        </MeProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
