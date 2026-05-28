import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['generate-articles', 'generate-operating-agreement', 'generate-bylaws', 'ein-application', 'generate-compliance-checklist', 'generate-resolution']).describe('Legal entity action'),
  entityType: z.enum(['llc', 'corporation', 'nonprofit', 's-corp']).default('llc').describe('Entity type'),
  jurisdiction: z.string().default('Delaware').describe('State or jurisdiction'),
  companyName: z.string().describe('Legal entity name'),
  registeredAgent: z.object({ name: z.string(), address: z.string() }).optional().describe('Registered agent details'),
  members: z.array(z.object({ name: z.string(), address: z.string(), ownershipPercent: z.number().min(0).max(100).optional(), role: z.string().optional() })).optional().describe('Members/owners'),
  purpose: z.string().optional().describe('Business purpose description'),
  fiscalYearEnd: z.string().optional().describe('Fiscal year end date (MM-DD)'),
  shares: z.object({ authorized: z.number().int().optional(), parValue: z.number().optional(), classes: z.array(z.object({ name: z.string(), count: z.number().int(), rights: z.string() })).optional() }).optional().describe('Stock information (corporation)'),
  taxExemptPurpose: z.string().optional().describe('Tax-exempt purpose (nonprofit)'),
  outputFormat: z.enum(['pdf', 'docx', 'txt']).default('pdf').describe('Output document format')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  documentPath: z.string().optional(),
  documentType: z.string().optional(),
  filingInstructions: z.string().optional(),
  estimatedFilingFee: z.number().optional(),
  filingUrl: z.string().optional(),
  checklists: z.array(z.object({ item: z.string(), completed: z.boolean(), notes: z.string().optional() })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
