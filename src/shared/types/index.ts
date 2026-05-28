// ─── Multi-AI Brainstorm Types ─────────────────────────────────

export type AiName = 'openai' | 'groq' | 'deepseek' | 'gemini';
export type BrainstormRound = 1 | 2 | 3 | 'consensus' | 'draft';

// Replace the existing ChatMessage interface with this:
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  reasoning?: string;
  timestamp: string;
  showReasoning?: boolean;
  // Brainstorm fields
  aiName?: AiName;
  round?: BrainstormRound;
  replyTo?: AiName | 'all';
  vote?: boolean;
  isFinalDraft?: boolean;
}

export interface BrainstormResponse {
  userMessage: ChatMessage;
  messages: ChatMessage[];
  finalDraft: ChatMessage;
  consensusReached: boolean;
}
