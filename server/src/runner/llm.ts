import Anthropic from "@anthropic-ai/sdk";

export interface TaskTurn {
  model: string;
  system: string;
  messages: Anthropic.Beta.BetaMessageParam[];
  tools: Anthropic.Beta.BetaToolUnion[];
  maxTokens: number;
}

export interface TaskLlm {
  run(turn: TaskTurn, onBlock: (b: Anthropic.Beta.BetaContentBlock) => void): Promise<Anthropic.Beta.BetaMessage>;
}

/** One streamed research turn. Refusal fallbacks route declined requests to Anthropic's recommended model. */
export function anthropicTaskLlm(client: Anthropic): TaskLlm {
  return {
    async run(turn, onBlock) {
      const stream = client.beta.messages.stream({
        model: turn.model,
        max_tokens: turn.maxTokens,
        system: turn.system,
        messages: turn.messages,
        tools: turn.tools,
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      stream.on("contentBlock", onBlock);
      return stream.finalMessage();
    },
  };
}
