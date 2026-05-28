import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['send-sms', 'send-push', 'initiate-call', 'send-email', 'verify-phone']).describe('Communication action'),
  provider: z.enum(['twilio', 'vonage', 'firebase', 'onesignal', 'sendgrid']).default('twilio').describe('Service provider'),
  to: z.string().describe('Recipient (phone, device token, or email)'),
  from: z.string().optional().describe('Sender ID or number'),
  message: z.string().optional().describe('Message content'),
  subject: z.string().optional().describe('Subject (email)'),
  templateId: z.string().optional().describe('Push notification template'),
  data: z.record(z.any()).optional().describe('Additional payload data'),
  mediaUrls: z.array(z.string().url()).optional().describe('Media URLs for MMS'),
  priority: z.enum(['high', 'normal', 'low']).default('normal').describe('Message priority')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  status: z.string().optional(),
  cost: z.number().optional(),
  error: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
