import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['track-event', 'query-analytics', 'create-report', 'run-funnel', 'run-ab-test', 'dashboard']).describe('Analytics action'),
  event: z.string().optional().describe('Event name'),
  properties: z.record(z.any()).optional().describe('Event properties'),
  userId: z.string().optional().describe('User identifier'),
  reportType: z.enum(['revenue', 'users', 'conversion', 'custom']).optional().describe('Report type'),
  dateRange: z.object({ start: z.string(), end: z.string() }).optional().describe('Date range'),
  funnelSteps: z.array(z.object({ name: z.string(), event: z.string() })).optional().describe('Funnel steps'),
  experimentName: z.string().optional().describe('A/B test name'),
  variants: z.array(z.object({ name: z.string(), config: z.record(z.any()) })).optional().describe('Test variants'),
  metrics: z.array(z.string()).optional().describe('Metrics to include'),
  groupBy: z.string().optional().describe('Dimension to group by'),
  segment: z.string().optional().describe('User segment filter')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  reportId: z.string().optional(),
  data: z.array(z.record(z.any())).optional(),
  summary: z.object({
    totalEvents: z.number().int().optional(),
    uniqueUsers: z.number().int().optional(),
    conversionRate: z.number().optional()
  }).optional(),
  funnel: z.array(z.object({ step: z.string(), users: z.number().int(), conversion: z.number() })).optional(),
  abTest: z.object({
    winner: z.string().optional(),
    confidence: z.number().optional(),
    results: z.array(z.object({ variant: z.string(), metric: z.number(), improvement: z.number() })).optional()
  }).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
