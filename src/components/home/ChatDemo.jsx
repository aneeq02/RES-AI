import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Check, CornerDownLeft } from "lucide-react";
import AgentAvatar from "../agents/AgentAvatar";
import { getMember } from "../../data/members";

// A scripted conversation that "streams" in like a live agent reply.
const SCRIPT = [
  { from: "user", text: "Soshie, plan my posts for next week." },
  {
    from: "agent",
    agent: "soshie",
    text: "Done! 7 posts drafted in your brand voice — 3 carousels, 2 reels, 2 stories. Best slots: Tue & Thu at 6 pm.",
    tasks: ["Captions written", "Hashtags researched", "Scheduled in Buffer"],
  },
  { from: "user", text: "Cassie, anything urgent in support?" },
  {
    from: "agent",
    agent: "cassie",
    text: "2 refund requests handled, 14 replies sent. One VIP customer flagged for you — draft reply is ready.",
    tasks: ["14 tickets closed", "Avg. reply 38 seconds"],
  },
];

const reduced = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-blink rounded-full bg-ink-soft" style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
}

function AgentMessage({ msg, streamed, done }) {
  const agent = getMember(msg.agent);
  return (
    <div className="flex items-start gap-3">
      <AgentAvatar member={agent} className="h-10 w-10 shrink-0 rounded-full border border-line" imgClassName="object-top scale-150 translate-y-3" />
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-bold text-brand-ink">{agent.name}</p>
        <div className="rounded-2xl rounded-tl-md border border-line bg-surface-3 px-4 py-3 text-sm leading-relaxed text-ink-soft">
          <span aria-hidden="true">{streamed === 0 ? <TypingDots /> : msg.text.slice(0, streamed)}</span>
          <span className="sr-only">{msg.text}</span>
        </div>
        {done && msg.tasks && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {msg.tasks.map((t) => (
              <li key={t} className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-ok/10 px-2.5 py-1 text-xs text-ok">
                <Check size={12} aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ChatDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  // step = index of the message currently animating; chars = characters revealed of it
  const [step, setStep] = useState(0);
  const [chars, setChars] = useState(0);
  // Reduced-motion users get the finished conversation immediately.
  const [skipAnimation] = useState(reduced);
  const current = skipAnimation ? SCRIPT.length : step;

  useEffect(() => {
    if (!inView || skipAnimation || step >= SCRIPT.length) return;
    const msg = SCRIPT[step];
    let t;
    if (msg.from === "user") {
      t = setTimeout(() => setStep((s) => s + 1), 700);
    } else if (chars === 0) {
      t = setTimeout(() => setChars(1), 1100); // "typing…" pause
    } else if (chars < msg.text.length) {
      t = setTimeout(() => setChars((c) => Math.min(c + 3, msg.text.length)), 22);
    } else {
      t = setTimeout(() => {
        setStep((s) => s + 1);
        setChars(0);
      }, 900);
    }
    return () => clearTimeout(t);
  }, [inView, skipAnimation, step, chars]);

  const visible = SCRIPT.slice(0, Math.min(current + 1, SCRIPT.length));

  return (
    <div ref={ref} className="rounded-[2rem] border border-line bg-surface-2/80 p-4 shadow-2xl shadow-black/50 sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
          </span>
          <span className="text-sm font-bold">Your team is online</span>
        </div>
        <span className="text-xs text-subtle">#workspace</span>
      </div>

      {/* Reserve height so the page doesn't jump as messages appear */}
      <div className="flex min-h-[420px] flex-col gap-5 sm:min-h-[380px]">
        {visible.map((msg, i) =>
          msg.from === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-brand px-4 py-3 text-sm font-medium text-on-brand">
              {msg.text}
            </div>
          ) : (
            <AgentMessage
              key={i}
              msg={msg}
              streamed={i < current ? msg.text.length : chars}
              done={i < current}
            />
          ),
        )}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-line bg-canvas/40 px-4 py-3 text-sm text-subtle">
        <span className="flex-1 truncate">Ask your team anything…</span>
        <CornerDownLeft size={16} aria-hidden="true" />
      </div>
    </div>
  );
}
