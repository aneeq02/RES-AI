import React from "react";
import { useLocation } from "react-router-dom";
import { headFor } from "./head";

/**
 * React 19 hoists <title>, <meta> and <link> into <head> automatically, so this
 * keeps the head in sync on client-side navigation. The prerenderer writes the
 * same tags into each page's static HTML.
 */
export default function Seo() {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const h = headFor(path);

  return (
    <>
      <title>{h.title}</title>
      <meta name="description" content={h.description} />
      <meta name="robots" content={h.robots} />
      {h.canonical && <link rel="canonical" href={h.canonical} />}
      {Object.entries(h.og).map(([k, v]) => (
        <meta key={k} property={k} content={v} />
      ))}
      {Object.entries(h.twitter).map(([k, v]) => (
        <meta key={k} name={k} content={v} />
      ))}
      {h.schema && (
        <script
          type="application/ld+json"
          // JSON-LD must be raw JSON; "<" is escaped so content can't close the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(h.schema).replace(/</g, "\\u003c") }}
        />
      )}
    </>
  );
}
