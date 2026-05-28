import { z } from 'zod';

export const InputSchema = z.object({
  scanType: z.enum(['dependency', 'ssl', 'port', 'full']).describe('Type of vulnerability scan'),
  target: z.string().describe('Target URL, hostname, or package.json path'),
  portRange: z.string().default('1-1024').describe('Port range for port scan'),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'all']).default('all').describe('Minimum severity to report'),
  timeout: z.number().int().positive().default(30000).describe('Timeout in milliseconds')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  summary: z.object({
    critical: z.number().int(),
    high: z.number().int(),
    medium: z.number().int(),
    low: z.number().int(),
    total: z.number().int()
  }),
  vulnerabilities: z.array(z.object({
    id: z.string(),
    title: z.string(),
    severity: z.string(),
    description: z.string(),
    affected: z.string(),
    remediation: z.string().optional(),
    cvssScore: z.number().optional()
  })),
  scanDuration: z.string()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
