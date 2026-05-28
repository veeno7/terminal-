import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['parse', 'analyze', 'search', 'anomalies', 'summarize']).describe('Log analysis action'),
  logSource: z.string().describe('Log file path or log content'),
  logFormat: z.enum(['json', 'apache', 'syslog', 'nginx', 'auto']).default('auto').describe('Log format'),
  filter: z.string().optional().describe('Filter pattern'),
  timeRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional().describe('Time range filter'),
  maxEntries: z.number().int().positive().default(100).describe('Max log entries to analyze')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  entries: z.array(z.object({
    timestamp: z.string(),
    level: z.string().optional(),
    message: z.string(),
    source: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })).optional(),
  summary: z.object({
    totalEntries: z.number().int(),
    errors: z.number().int(),
    warnings: z.number().int(),
    info: z.number().int(),
    timeRange: z.object({
      start: z.string(),
      end: z.string()
    })
  }).optional(),
  anomalies: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    description: z.string(),
    occurrences: z.number().int(),
    affectedEntries: z.array(z.string()).optional()
  })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
