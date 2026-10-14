import React from "react";

// Wordmark: "res" in ink with a lime full stop, the signal colour of the brand.
export default function Logo({ className = "text-3xl md:text-4xl" }) {
  return (
    <span className={`select-none font-display font-extrabold tracking-[-0.06em] text-ink ${className}`} aria-label="res">
      <span aria-hidden="true">res</span>
      <span className="text-brand-ink" aria-hidden="true">.</span>
    </span>
  );
}
