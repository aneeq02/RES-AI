import React, { useId, useState } from "react";
import { Plus } from "lucide-react";

function FaqItem({ q, a, open, onToggle }) {
  const id = useId();
  return (
    <li className={`rounded-3xl border transition-colors duration-200 ${open ? "border-brand/40 bg-surface-3" : "border-line bg-surface-2/60 hover:border-line-strong"}`}>
      <h3 className="font-sans">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          className="flex min-h-16 w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-bold md:text-lg"
        >
          {q}
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition duration-300 ${open ? "rotate-45 border-brand bg-brand text-white" : "border-line text-zinc-300"}`}
            aria-hidden="true"
          >
            <Plus size={18} />
          </span>
        </button>
      </h3>
      {/* Answers always stay in the HTML (so search engines and AI answer engines can read
          them); closed panels collapse visually via the grid-rows 0fr → 1fr transition. */}
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 leading-relaxed text-zinc-300">{a}</p>
        </div>
      </div>
    </li>
  );
}

export default function FaqList({ items, className = "", defaultOpen = 0 }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <FaqItem key={item.q} {...item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
      ))}
    </ul>
  );
}
