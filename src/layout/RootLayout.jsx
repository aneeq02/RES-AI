import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import GetStartedModal from "../components/modals/GetStartedModal";
import ScrollToTop from "../components/utils/ScrollToTop";

export default function RootLayout() {
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white font-sans overflow-x-hidden">
      <ScrollToTop />
      <Navbar onOpenGetStarted={() => setIsGetStartedOpen(true)} />
      <GetStartedModal isOpen={isGetStartedOpen} onClose={() => setIsGetStartedOpen(false)} />
      <Outlet />
    </div>
  );
}
