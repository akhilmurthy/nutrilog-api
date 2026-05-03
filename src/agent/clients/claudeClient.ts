import Anthropic from '@anthropic-ai/sdk';
import { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream';

export class ClaudeClient {
  private client: Anthropic | null = null;
  private model = 'claude-sonnet-4-20250514';

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set');
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async chat(params: {
    systemPrompt: string;
    messages: Anthropic.MessageParam[];
    tools?: Anthropic.Tool[];
    maxTokens?: number;
  }): Promise<Anthropic.Message> {
    return this.getClient().messages.create({
      model: this.model,
      max_tokens: params.maxTokens || 4096,
      system: params.systemPrompt,
      messages: params.messages,
      tools: params.tools,
    });
  }

  chatStream(params: {
    systemPrompt: string;
    messages: Anthropic.MessageParam[];
    tools?: Anthropic.Tool[];
    maxTokens?: number;
  }): MessageStream {
    return this.getClient().messages.stream({
      model: this.model,
      max_tokens: params.maxTokens || 4096,
      system: params.systemPrompt,
      messages: params.messages,
      tools: params.tools,
    });
  }
}

export const claudeClient = new ClaudeClient();
