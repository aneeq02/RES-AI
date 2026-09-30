import React from "react";
import RevealOnScroll from "../motion/RevealOnScroll";

export default function SectionHeading({ eyebrow, title, children, align = "center", as: Tag = "h2", className = "" }) {
  const centered = align === "center";
  return (
    <RevealOnScroll className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && <span className="eyebrow mb-6">{eyebrow}</span>}
      <Tag className={Tag === "h1" ? "page-title" : "section-title"}>{title}</Tag>
      {children && <p className={`mt-5 text-lg leading-relaxed text-muted ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>{children}</p>}
    </RevealOnScroll>
  );
}
