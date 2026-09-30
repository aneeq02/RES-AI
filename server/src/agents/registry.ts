import { buddy } from "./buddy.js";
import type { AgentConfig } from "./types.js";

// Agents go live alphabetically; add each one here as it ships.
const LIVE: AgentConfig[] = [buddy];

export const liveAgents = () => LIVE;
export const getAgent = (id: string) => LIVE.find((a) => a.id === id);

export function agentDto(a: AgentConfig) {
  return {
    id: a.id,
    taskKinds: Object.entries(a.taskKinds).map(([kind, k]) => ({
      kind,
      label: k.label,
      description: k.description,
      credits: k.credits,
      etaMinutes: k.etaMinutes,
    })),
  };
}
