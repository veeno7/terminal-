import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import type { ChatMessage } from '../../shared/types/index.js';

let chatHistory: ChatMessage[] = [];

export function getChatHistory(_req: Request, res: Response) {
  res.json(chatHistory);
}

export async function sendMessage(req: Request, res: Response) {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const userMsg: ChatMessage = {
    id: uuid(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };
  chatHistory.push(userMsg);

  const agentMsg: ChatMessage = {
    id: uuid(),
    role: 'agent',
    content: `I received your message: "${message}". I'm processing it through my cognitive systems.`,
    reasoning: `Processing user input through perception → reasoning pipeline. ${message.length > 50 ? 'Complex request requiring deep deliberation.' : 'Simple query suitable for fast response.'}`,
    timestamp: new Date().toISOString(),
    showReasoning: false,
  };
  chatHistory.push(agentMsg);

  res.json({ userMessage: userMsg, agentMessage: agentMsg });
}
