import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['compliance-check', 'pentest', 'threat-intel', 'audit-log', 'generate-report']).describe('Compliance action'),
  standard: z.enum(['soc2', 'hipaa', 'gdpr', 'pci-dss', 'iso27001', 'custom']).default('custom').describe('Compliance standard'),
  target: z.string().describe('Target system, URL, or scope'),
  tests: z.array(z.string()).optional().describe('Specific tests to run'),
  scope: z.string().optional().describe('Audit scope description'),
  reportFormat: z.enum(['json', 'html', 'pdf']).default('json').describe('Output report format'),
  threatActor: z.string().optional().describe('Threat actor to gather intel on')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  complianceStatus: z.enum(['pass', 'fail', 'partial']).optional(),
  score: z.number().optional(),
  checks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['pass', 'fail', 'warning', 'na']),
    description: z.string(),
    remediation: z.string().optional()
  })).optional(),
  vulnerabilities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    severity: z.string(),
    description: z.string()
  })).optional(),
  reportUrl: z.string().optional(),
  summary: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
