import React, { useMemo } from "react";
import { renderMarkdown } from "../../lib/markdown";

export default function Markdown({ text, className = "" }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return <div className={`prose-res ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
