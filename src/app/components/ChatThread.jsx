import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, FileText, LoaderCircle } from "lucide-react";
import Markdown from "./Markdown";
import TaskCard from "./TaskCard";
import { api, streamChat } from "../../lib/api";

// Follow new content only while the reader is already at (or near) the bottom.
const STICK_PX = 80;

/** A short plain-text preview of a markdown reply for the screen-reader announcement. */
const preview = (md) => md.replace(/[#*_`>|[\]]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);

export default function ChatThread({ threadId, agent, canChat, starter, onActivity, lockedPlaceholder = "Choose a plan to start chatting" }) {
  const [data, setData] = useState({ messages: [], tasks: {}, deliverables: {} });
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(null); // { user, text } while a reply streams
  const [error, setError] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const listRef = useRef(null);
  const stick = useRef(true);

  const load = useCallback(async () => setData(await api(`/threads/${threadId}/messages`)), [threadId]);
  useEffect(() => { load().catch(() => setError("Couldn't load this conversation.")); }, [load]);
  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [data, streaming]);

  const onScroll = () => {
    const el = listRef.current;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_PX;
  };

  const send = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    setError(null);
    setAnnouncement("");
    stick.current = true; // sending jumps to your own message
    setStreaming({ user: text, text: "" });
    let received = false;
    let reply = "";
    let failed = false;
    try {
      await streamChat(threadId, text, (event, payload) => {
        received = true;
        if (event === "text") {
          reply += payload.delta;
          setStreaming((s) => ({ ...s, text: s.text + payload.delta }));
        }
        if (event === "error") {
          failed = true;
          setError(payload.message);
        }
      });
      if (!failed) setAnnouncement(reply.trim() ? `${agent.name} replied: ${preview(reply)}` : `${agent.name} replied.`);
    } catch (err) {
      setError(
        err.status === 429 ? "You're sending messages quickly. Try again in a bit."
          : err.status === 402 ? "Choose a plan to chat."
          : received ? "Connection dropped. The reply may still be saving; refresh in a moment."
          : "Message failed to send.",
      );
    } finally {
      await load().catch(() => {});
      setStreaming(null);
      onActivity?.();
    }
  };

  const onKeyDown = (e) => {
    // Enter confirms an IME composition (e.g. Japanese, Chinese input); it must not send.
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    send();
  };

  const addTask = (task) => setData((d) => ({ ...d, tasks: { ...d.tasks, [task.id]: task } })) || load();

  const renderBlock = (b, i) => {
    if (b.type === "text") return <Markdown key={i} text={b.text} />;
    if (b.type === "task" && data.tasks[b.taskId]) return <TaskCard key={b.taskId} initialTask={data.tasks[b.taskId]} canStart={canChat} onRetried={addTask} />;
    if (b.type === "deliverable" && data.deliverables[b.deliverableId]) {
      const d = data.deliverables[b.deliverableId];
      return (
        <Link key={i} to={`/app/deliverables/${d.id}`} className="spot mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-3 text-sm transition hover:border-brand/50">
          <FileText size={18} className="text-brand-ink" aria-hidden="true" /> <span><span className="font-bold">Report ready:</span> {d.title}</span>
        </Link>
      );
    }
    return null;
  };

  const empty = data.messages.length === 0 && !streaming;

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[480px] flex-col">
      <div ref={listRef} onScroll={onScroll} aria-busy={streaming ? "true" : "false"} className="flex-1 space-y-5 overflow-y-auto pr-1">
        {empty && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="font-display text-3xl font-extrabold tracking-[-0.03em]">Ask {agent.name} <span className="hl">anything</span></p>
              <button type="button" onClick={() => setDraft(starter)} className="mt-4 rounded-full border border-brand/40 bg-brand/10 px-5 py-2.5 text-sm text-ink transition hover:bg-brand/20">"{starter}"</button>
            </div>
          </div>
        )}
        {data.messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md border border-brand/30 bg-brand/10 px-4 py-3" : "max-w-[92%]"}>
            {m.role !== "user" && <span aria-hidden="true" className="mb-1.5 flex items-center gap-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-subtle"><span className="h-1.5 w-1.5 rounded-full bg-brand" />{agent.name}</span>}
            {m.content.map(renderBlock)}
          </div>
        ))}
        {streaming && (
          <>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md border border-brand/30 bg-brand/10 px-4 py-3"><p>{streaming.user}</p></div>
            <div className="max-w-[92%]">
              {streaming.text ? <Markdown text={streaming.text} /> : <LoaderCircle className="animate-spin text-muted" aria-label={`${agent.name} is typing`} />}
            </div>
          </>
        )}
      </div>
      {/* Announces each finished reply once, instead of re-reading the growing stream on every delta. */}
      <p role="status" className="sr-only">{announcement}</p>
      {error && <p className="field-error" role="alert">{error}</p>}
      <form onSubmit={send} className="mt-4 flex items-end gap-2 rounded-3xl border border-line-strong bg-surface-2/70 p-2 backdrop-blur-md transition focus-within:border-brand-ink focus-within:ring-2 focus-within:ring-brand/20">
        <label htmlFor="chat-input" className="sr-only">Message {agent.name}</label>
        <textarea id="chat-input" rows={1} value={draft} disabled={!canChat} maxLength={4000}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={canChat ? `Message ${agent.name}…` : lockedPlaceholder}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-subtle" />
        <button type="submit" disabled={!canChat || !draft.trim() || Boolean(streaming)} className="btn-primary h-11 w-11 shrink-0 p-0" aria-label="Send">
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
