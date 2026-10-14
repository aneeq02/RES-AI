import React, { useState } from "react";
import {
  CalendarCheck,
  ChartLine,
  Compass,
  Handshake,
  Headphones,
  Mail,
  Megaphone,
  PenLine,
  Search,
  ShoppingBag,
  Sprout,
  UserSearch,
  Bot,
} from "lucide-react";

const ICONS = { CalendarCheck, ChartLine, Compass, Handshake, Headphones, Mail, Megaphone, PenLine, Search, ShoppingBag, Sprout, UserSearch };

export function AgentIcon({ name, ...props }) {
  const Icon = ICONS[name] || Bot;
  return <Icon aria-hidden="true" {...props} />;
}

/**
 * Agent artwork on a soft gradient stage. Falls back to a role icon when the
 * agent has no image (or it fails to load) so every card looks intentional.
 */
export default function AgentAvatar({ member, className = "", imgClassName = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  const showImage = member.img && !failed;

  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-25`} aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      {showImage ? (
        <img
          src={member.img}
          alt={`${member.name}, ${member.role}`}
          onError={() => setFailed(true)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          width={408}
          height={612}
          draggable={false}
          className={`relative h-full w-full object-contain object-bottom ${imgClassName}`}
        />
      ) : (
        <div className="relative grid h-full w-full place-items-center">
          <div className="grid h-24 w-24 place-items-center rounded-[1.75rem] border border-ink/15 bg-canvas/40 backdrop-blur-sm">
            <AgentIcon name={member.icon} size={40} strokeWidth={1.6} className="text-ink" />
          </div>
          <span className="sr-only">{`${member.name}, ${member.role}`}</span>
        </div>
      )}
    </div>
  );
}
