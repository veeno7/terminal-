import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['send-alert', 'acknowledge', 'resolve', 'list-alerts', 'create-incident', 'update-escalation']).describe('Alerting action'),
  provider: z.enum(['pagerduty', 'webhook', 'email', 'sms', 'slack']).default('webhook').describe('Alerting provider'),
  title: z.string().describe('Alert title'),
  message: z.string().describe('Alert message body'),
  severity: z.enum(['critical', 'warning', 'info']).default('warning').describe('Alert severity'),
  source: z.string().optional().describe('Alert source (service or system name)'),
  alertId: z.string().optional().describe('Alert ID for acknowledge/resolve'),
  webhookUrl: z.string().url().optional().describe('Custom webhook URL'),
  recipients: z.array(z.string()).optional().describe('Alert recipients'),
  escalationPolicy: z.object({
    levels: z.number().int().positive().optional(),
    intervals: z.array(z.number().int()).optional()
  }).optional().describe('Escalation policy config'),
  metadata: z.record(z.any()).optional().describe('Additional alert metadata')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  alertId: z.string(),
  status: z.string(),
  acknowledgedBy: z.string().optional(),
  createdAt: z.string(),
  deliveryStatus: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
