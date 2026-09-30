import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, FileText, LoaderCircle } from "lucide-react";
import Markdown from "./Markdown";
import TaskCard from "./TaskCard";
import { api, streamChat } from "../../lib/api";

export default function ChatThread({ threadId, agent, canChat, starter, onActivity }) {
  const [data, setData] = useState({ messages: [], tasks: {}, deliverables: {} });
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(null); // { user, text } while a reply streams
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  const load = useCallback(async () => setData(await api(`/threads/${threadId}/messages`)), [threadId]);
  useEffect(() => { load().catch(() => setError("Couldn't load this conversation.")); }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [data, streaming]);

  const send = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    setError(null);
    setStreaming({ user: text, text: "" });
    try {
      await streamChat(threadId, text, (event, payload) => {
        if (event === "text") setStreaming((s) => ({ ...s, text: s.text + payload.delta }));
        if (event === "error") setError(payload.message);
      });
    } catch (err) {
      setError(err.status === 429 ? "You're sending messages quickly. Try again in a bit." : err.status === 402 ? "Choose a plan to chat." : "Message failed to send.");
    } finally {
      await load().catch(() => {});
      setStreaming(null);
      onActivity?.();
    }
  };

  const addTask = (task) => setData((d) => ({ ...d, tasks: { ...d.tasks, [task.id]: task } })) || load();

  const renderBlock = (b, i) => {
    if (b.type === "text") return <Markdown key={i} text={b.text} />;
    if (b.type === "task" && data.tasks[b.taskId]) return <TaskCard key={b.taskId} initialTask={data.tasks[b.taskId]} canStart={canChat} onRetried={addTask} />;
    if (b.type === "deliverable" && data.deliverables[b.deliverableId]) {
      const d = data.deliverables[b.deliverableId];
      return (
        <Link key={i} to={`/app/deliverables/${d.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm transition hover:border-brand/50">
          <FileText size={18} className="text-brand-ink" aria-hidden="true" /> <span><span className="font-bold">Report ready:</span> {d.title}</span>
        </Link>
      );
    }
    return null;
  };

  const empty = data.messages.length === 0 && !streaming;

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[480px] flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto pr-1" aria-live="polite">
        {empty && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-lg font-bold">Ask {agent.name} anything</p>
              <button type="button" onClick={() => setDraft(starter)} className="mt-3 rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-white">"{starter}"</button>
            </div>
          </div>
        )}
        {data.messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-white/10 px-4 py-3" : "max-w-[92%]"}>
            {m.content.map(renderBlock)}
          </div>
        ))}
        {streaming && (
          <>
            <div className="ml-auto max-w-[85%] rounded-2xl bg-white/10 px-4 py-3"><p>{streaming.user}</p></div>
            <div className="max-w-[92%]">
              {streaming.text ? <Markdown text={streaming.text} /> : <LoaderCircle className="animate-spin text-muted" aria-label={`${agent.name} is typing`} />}
            </div>
          </>
        )}
        <div ref={endRef} />
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <form onSubmit={send} className="mt-4 flex items-end gap-2 rounded-2xl border border-line bg-surface-2 p-2">
        <label htmlFor="chat-input" className="sr-only">Message {agent.name}</label>
        <textarea id="chat-input" rows={1} value={draft} disabled={!canChat} maxLength={4000}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={canChat ? `Message ${agent.name}…` : "Choose a plan to start chatting"}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-subtle" />
        <button type="submit" disabled={!canChat || !draft.trim() || Boolean(streaming)} className="btn-primary h-11 w-11 shrink-0 p-0" aria-label="Send">
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
