import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AgentAvatar from "../../components/agents/AgentAvatar";
import ThreadList from "../components/ThreadList";
import ChatThread from "../components/ChatThread";
import { getMember } from "../../data/members";
import { useMe } from "../../context/MeContext";
import { api } from "../../lib/api";
import { hasActivePlan, subscriptionNeedsPayment } from "../../lib/subscription";
import PaymentIssueNotice from "../../components/billing/PaymentIssueNotice";
import { pickThread } from "../pickThread";

export default function AgentWorkspace() {
  const { id } = useParams();
  const member = getMember(id);
  const { me } = useMe();
  const live = me?.agents?.some((a) => a.id === id);
  const [params, setParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const activeId = pickThread(params.get("thread"), threads);
  const planActive = hasActivePlan(me);
  const needsPayment = subscriptionNeedsPayment(me);

  const loadThreads = useCallback(async () => {
    const { threads: list } = await api(`/threads?agent=${id}`);
    setThreads(list);
    return list;
  }, [id]);

  const newThread = useCallback(async () => {
    const { thread } = await api("/threads", { method: "POST", body: { agentId: id } });
    setThreads((t) => [thread, ...t]);
    setParams({ thread: thread.id });
  }, [id, setParams]);

  // Guard so StrictMode's double effect run doesn't create two empty threads.
  const creating = useRef(false);
  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    api(`/threads?agent=${id}`).then(({ threads: list }) => {
      if (cancelled) return;
      setThreads(list);
      if (list.length === 0 && !creating.current) {
        creating.current = true;
        newThread();
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [live, id, newThread]);

  if (!member) return <p>Unknown agent. <Link to="/app" className="underline">Back to your team</Link></p>;

  if (!live)
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <AgentAvatar member={member} className="mx-auto aspect-square w-40 rounded-2xl" />
        <h1 className="mt-6 text-2xl font-bold">{member.name} is coming soon</h1>
        <p className="mt-2 text-muted">Agents launch one at a time. {member.name} will appear here as soon as they're ready.</p>
        <Link to="/app" className="btn-secondary mt-6"><ArrowLeft size={16} aria-hidden="true" /> Back to your team</Link>
      </div>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-4">
        <div className="flex items-center gap-3">
          <AgentAvatar member={member} className="h-14 w-12 shrink-0 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold">{member.name}</h1>
            <p className="text-xs text-brand-ink">{member.role}</p>
          </div>
        </div>
        <ThreadList threads={threads} activeId={activeId} onSelect={(tid) => setParams({ thread: tid })} onNew={newThread} />
      </aside>
      <section aria-label={`Chat with ${member.name}`}>
        {needsPayment && <PaymentIssueNotice className="mb-4" />}
        {!planActive && !needsPayment && (
          <p className="mb-4 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
            <Link to="/checkout" className="font-bold text-white underline">Choose a plan</Link> to chat with {member.name} and run tasks.
          </p>
        )}
        {activeId && <ChatThread key={activeId} threadId={activeId} agent={member} canChat={planActive} lockedPlaceholder={needsPayment ? "Update your payment method to keep chatting" : undefined} starter={member.prompt} onActivity={loadThreads} />}
      </section>
    </div>
  );
}
