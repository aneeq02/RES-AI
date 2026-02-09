import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import RootLayout from "../layout/RootLayout";

import Home from "../pages/Home";
import Services from "../pages/Services";
import Agents from "../pages/Agents";
import Pricing from "../pages/Pricing";
import About from "../pages/About";
import FAQ from "../pages/FAQ";
import Contact from "../pages/Contact";
import Checkout from "../pages/Checkout";
import CRM from "../pages/CRM";
import WebsiteManagement from "../pages/WebsiteManagement";

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/website-management" element={<WebsiteManagement />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
