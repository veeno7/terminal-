import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['extract-text', 'extract-tables', 'extract-images', 'ocr', 'get-metadata']).describe('Parsing action'),
  filePath: z.string().describe('Path to document file'),
  language: z.string().default('eng').describe('OCR language code'),
  pageRange: z.string().optional().describe('Page range (e.g. "1-5,8")'),
  includeImages: z.boolean().default(false).describe('Extract embedded images')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  text: z.string().optional(),
  pages: z.number().int().optional(),
  tables: z.array(z.array(z.array(z.string()))).optional(),
  images: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
