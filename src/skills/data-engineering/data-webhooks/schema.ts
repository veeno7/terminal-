import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['listen', 'register', 'list', 'delete', 'test', 'get-logs']).describe('Webhook action'),
  webhookId: z.string().optional().describe('Webhook ID'),
  name: z.string().optional().describe('Webhook name'),
  url: z.string().url().optional().describe('Webhook URL (for registration)'),
  endpoint: z.string().optional().describe('Local endpoint path'),
  secret: z.string().optional().describe('Webhook secret for verification'),
  filters: z.object({
    events: z.array(z.string()).optional(),
    headers: z.record(z.string()).optional()
  }).optional().describe('Webhook event filters'),
  maxRetries: z.number().int().min(0).max(10).default(3).describe('Maximum delivery retries'),
  timeout: z.number().int().positive().default(30000).describe('Response timeout in ms')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  webhookId: z.string().optional(),
  endpoint: z.string().optional(),
  webhooks: z.array(z.object({ id: z.string(), name: z.string(), url: z.string(), status: z.string(), lastDelivery: z.string().optional() })).optional(),
  logs: z.array(z.object({ id: z.string(), event: z.string(), status: z.string(), received: z.string(), responseCode: z.number().int() })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
