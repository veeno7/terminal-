import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['translate', 'detect-language', 'batch-translate', 'list-languages']).describe('Translation action'),
  text: z.string().optional().describe('Text to translate'),
  targetLanguage: z.string().default('en').describe('Target language code'),
  sourceLanguage: z.string().optional().describe('Source language code (auto-detect if omitted)'),
  texts: z.array(z.string()).optional().describe('Texts for batch translation'),
  preserveFormatting: z.boolean().default(true).describe('Preserve original formatting'),
  domain: z.enum(['general', 'technical', 'medical', 'legal', 'financial']).default('general').describe('Translation domain'),
  glossary: z.record(z.string()).optional().describe('Glossary terms (source -> target)')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  translatedText: z.string().optional(),
  detectedLanguage: z.string().optional(),
  confidence: z.number().optional(),
  translations: z.array(z.object({ source: z.string(), translation: z.string(), detectedLanguage: z.string().optional() })).optional(),
  languages: z.array(z.object({ code: z.string(), name: z.string() })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
