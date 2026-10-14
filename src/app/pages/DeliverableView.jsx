import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download, MessageSquare } from "lucide-react";
import Markdown from "../components/Markdown";
import { formatDate } from "../components/CreditsMeter";
import { api } from "../../lib/api";
import { getMember } from "../../data/members";
import { safeHref } from "../../lib/safeUrl";

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "report";

function DeliverableContent({ id }) {
  const [d, setD] = useState(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    api(`/deliverables/${id}`).then((r) => {
      if (!cancelled) setD(r.deliverable);
    }).catch(() => {
      if (!cancelled) setMissing(true);
    });
    return () => { cancelled = true; };
  }, [id]);

  if (missing) return <p>Report not found. <Link to="/app/deliverables" className="underline">Back to the library</Link></p>;
  if (!d) return <p className="text-muted" role="status">Loading…</p>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(d.bodyMd);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([d.bodyMd], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${slug(d.title)}.md` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/app/deliverables" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> All deliverables</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-subtle">{getMember(d.agentId)?.name} · {formatDate(d.createdAt)}{d.partial ? " · Partial: research limit reached" : ""}</p>
        <div className="flex gap-2">
          <button type="button" onClick={copy} className="btn-secondary min-h-11 px-4 py-2 text-sm">{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied ? "Copied" : "Copy"}</button>
          <button type="button" onClick={download} className="btn-secondary min-h-11 px-4 py-2 text-sm"><Download size={16} aria-hidden="true" /> .md</button>
          <Link to={`/app/agents/${d.agentId}?thread=${d.threadId}`} className="btn-light min-h-11 px-4 py-2 text-sm"><MessageSquare size={16} aria-hidden="true" /> Follow up</Link>
        </div>
      </div>
      {copyError && <p role="alert" className="mt-4 rounded bg-danger/20 px-4 py-2 text-sm text-danger">Couldn't copy. Select the text and copy it manually.</p>}
      <div className="card mt-6 p-6 md:p-10"><Markdown text={d.bodyMd} /></div>
      {d.sources.length > 0 && (
        <section className="mt-8" aria-labelledby="sources-h">
          <h2 id="sources-h" className="text-lg font-bold">Sources</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
            {d.sources.map((s) => {
              const href = safeHref(s.url);
              return (
                <li key={s.url}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="break-words text-brand-ink underline">{s.title || s.url}</a>
                  ) : (
                    <span className="break-words">{s.title || s.url}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </article>
  );
}

export default function DeliverableView() {
  const { id } = useParams();
  return <DeliverableContent key={id} id={id} />;
}
