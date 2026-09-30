import React from "react";

// Wordmark from the brand logo: red "r" and "s" (client-approved), white "e" for dark backgrounds.
export default function Logo({ className = "text-3xl md:text-4xl" }) {
  return (
    <span className={`select-none font-display font-bold tracking-tighter text-white ${className}`} aria-label="res">
      <span className="text-logo" aria-hidden="true">r</span>
      <span aria-hidden="true">e</span>
      <span className="text-logo" aria-hidden="true">s</span>
    </span>
  );
}
