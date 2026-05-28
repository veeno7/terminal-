import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['analyze', 'batch-analyze', 'extract-entities', 'detect-emotions']).describe('Analysis action'),
  text: z.string().optional().describe('Text to analyze'),
  texts: z.array(z.string()).optional().describe('Texts for batch analysis'),
  language: z.string().default('en').describe('Text language'),
  includeEntities: z.boolean().default(true).describe('Extract named entities'),
  granularity: z.enum(['sentence', 'document']).default('document').describe('Analysis granularity')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  sentiment: z.object({
    score: z.number(),
    label: z.enum(['positive', 'negative', 'neutral', 'mixed']),
    confidence: z.number()
  }).optional(),
  emotions: z.object({
    joy: z.number(),
    sadness: z.number(),
    anger: z.number(),
    fear: z.number(),
    surprise: z.number()
  }).optional(),
  entities: z.array(z.object({
    name: z.string(),
    type: z.string(),
    confidence: z.number(),
    mentions: z.array(z.object({ text: z.string(), position: z.object({ start: z.number(), end: z.number() }) }))
  })).optional(),
  results: z.array(z.object({ text: z.string(), sentiment: z.any() })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
