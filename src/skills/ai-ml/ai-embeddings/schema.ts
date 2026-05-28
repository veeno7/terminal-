import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['generate', 'compare', 'search', 'list-models']).describe('Embeddings action'),
  model: z.string().default('text-embedding-3-small').describe('Embedding model name'),
  input: z.union([z.string(), z.array(z.string())]).describe('Text or images to embed'),
  inputType: z.enum(['text', 'image']).default('text').describe('Input type'),
  dimensions: z.number().int().positive().default(1536).describe('Output dimensions'),
  normalize: z.boolean().default(true).describe('Normalize embeddings'),
  query: z.string().optional().describe('Search query text'),
  compareTexts: z.array(z.string()).optional().describe('Texts to compare'),
  topK: z.number().int().positive().default(5).describe('Top K results for search')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  embeddings: z.array(z.array(z.number())).optional(),
  dimensions: z.number().int().optional(),
  model: z.string().optional(),
  similarities: z.array(z.object({
    text: z.string(),
    score: z.number(),
    index: z.number().int()
  })).optional(),
  searchResults: z.array(z.object({
    text: z.string(),
    score: z.number(),
    metadata: z.record(z.any()).optional()
  })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
