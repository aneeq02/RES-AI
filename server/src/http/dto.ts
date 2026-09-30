import { getAgent } from "../agents/registry.js";

const iso = (d: Date | string | null) => (d ? new Date(d).toISOString() : null);

export function taskDto(r: any) {
  const kind = getAgent(r.agent_id)?.taskKinds[r.kind];
  return {
    id: r.id,
    agentId: r.agent_id,
    threadId: r.thread_id,
    kind: r.kind,
    label: kind?.label ?? r.kind,
    brief: r.brief,
    status: r.status,
    credits: r.credits_charged,
    etaMinutes: kind?.etaMinutes ?? null,
    error: r.error,
    createdAt: iso(r.created_at),
    startedAt: iso(r.started_at),
    finishedAt: iso(r.finished_at),
    deliverableId: r.deliverable_id ?? null,
  };
}

export const businessDto = (r: any) =>
  r ? { company: r.company, website: r.website, industry: r.industry, audience: r.audience, competitors: r.competitors, brandVoice: r.brand_voice } : null;

export const deliverableSummary = (r: any) => ({ id: r.id, agentId: r.agent_id, title: r.title, partial: r.partial, createdAt: iso(r.created_at), taskId: r.task_id });

export { iso };
