import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['search', 'index', 'scrape', 'delete-index', 'suggest', 'reindex']).describe('Search action'),
  engine: z.enum(['elasticsearch', 'meilisearch', 'typesense', 'algolia', 'custom']).default('elasticsearch').describe('Search engine'),
  index: z.string().describe('Index or collection name'),
  query: z.string().optional().describe('Search query'),
  documents: z.array(z.record(z.any())).optional().describe('Documents to index'),
  url: z.string().url().optional().describe('URL to scrape'),
  scrapeSelectors: z.record(z.string()).optional().describe('CSS selectors for scraping (field -> selector)'),
  filters: z.record(z.any()).optional().describe('Search filters'),
  sort: z.string().optional().describe('Sort field and direction'),
  page: z.number().int().positive().default(1).describe('Page number'),
  pageSize: z.number().int().positive().max(100).default(20).describe('Results per page'),
  facets: z.array(z.string()).optional().describe('Facet fields'),
  highlightFields: z.array(z.string()).optional().describe('Fields to highlight')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  hits: z.array(z.object({ id: z.string(), score: z.number(), source: z.record(z.any()), highlights: z.record(z.string()).optional() })).optional(),
  totalHits: z.number().int().optional(),
  facets: z.record(z.array(z.object({ value: z.string(), count: z.number().int() }))).optional(),
  suggestions: z.array(z.string()).optional(),
  scrapedData: z.record(z.any()).optional(),
  indexStatus: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
