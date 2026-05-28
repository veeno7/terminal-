import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['generate', 'merge', 'split', 'sign', 'convert', 'add-watermark']).describe('PDF action'),
  content: z.string().optional().describe('HTML or text content for generation'),
  filePath: z.string().optional().describe('Output file path'),
  files: z.array(z.string()).optional().describe('Files to merge'),
  splitPages: z.array(z.number().int()).optional().describe('Page numbers for split'),
  signatureData: z.string().optional().describe('Base64 signature image'),
  watermark: z.string().optional().describe('Watermark text'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait').describe('Page orientation'),
  pageSize: z.enum(['a4', 'letter', 'legal']).default('a4').describe('Page size'),
  metadata: z.object({ title: z.string().optional(), author: z.string().optional(), subject: z.string().optional() }).optional()
});

export const OutputSchema = z.object({
  success: z.boolean(),
  filePath: z.string().optional(),
  pages: z.number().int().optional(),
  fileSize: z.number().int().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
