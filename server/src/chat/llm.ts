import Anthropic from "@anthropic-ai/sdk";

export interface ChatLlm {
  stream(
    p: { model: string; system: string; messages: Anthropic.MessageParam[]; tools: Anthropic.Tool[] },
    onText: (delta: string) => void,
  ): Promise<Anthropic.Message>;
}

export function anthropicChatLlm(client: Anthropic): ChatLlm {
  return {
    async stream(p, onText) {
      const stream = client.messages.stream({
        model: p.model,
        max_tokens: 8000,
        system: p.system,
        messages: p.messages,
        tools: p.tools,
        output_config: { effort: "medium" },
      });
      stream.on("text", onText);
      return stream.finalMessage();
    },
  };
}
