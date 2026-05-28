import { z } from 'zod';

export const InputSchema = z.object({
  platform: z.enum(['slack', 'discord']).describe('Messaging platform'),
  action: z.enum(['send-message', 'read-channel', 'list-channels', 'create-webhook', 'add-reaction']).describe('Action to perform'),
  channel: z.string().describe('Channel ID or name'),
  message: z.string().optional().describe('Message text content'),
  threadTs: z.string().optional().describe('Thread timestamp (Slack)'),
  attachments: z.array(z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    color: z.string().optional()
  })).optional().describe('Rich message attachments'),
  webhookUrl: z.string().url().optional().describe('Webhook URL for incoming webhooks'),
  reaction: z.string().optional().describe('Emoji reaction to add'),
  limit: z.number().int().positive().default(50).describe('Max messages to fetch')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  timestamp: z.string().optional(),
  messages: z.array(z.object({
    id: z.string(),
    user: z.string(),
    text: z.string(),
    timestamp: z.string(),
    attachments: z.array(z.any()).optional()
  })).optional(),
  channels: z.array(z.object({
    id: z.string(),
    name: z.string(),
    topic: z.string().optional(),
    memberCount: z.number().int().optional()
  })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
