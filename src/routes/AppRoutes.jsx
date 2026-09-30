import React from "react";
import { Routes, Route } from "react-router-dom";
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
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  // The layout stays mounted across navigations; page transitions happen inside it.
  return (
    <Routes>
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
