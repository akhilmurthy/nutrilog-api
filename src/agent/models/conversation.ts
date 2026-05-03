export type MessageRole = 'user' | 'assistant';

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  result?: any;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationInput {
  title?: string;
}

export interface SendMessageInput {
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: Message;
  toolsUsed?: string[];
}

// Streaming event types
export type StreamEvent =
  | { type: 'message_start'; conversationId: string }
  | { type: 'text_delta'; text: string }
  | { type: 'tool_start'; id: string; name: string; input: Record<string, any> }
  | { type: 'tool_result'; id: string; name: string; success: boolean; result: any }
  | { type: 'message_complete'; message: Message; toolsUsed: string[] }
  | { type: 'error'; message: string };
