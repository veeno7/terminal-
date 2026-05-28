import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['extract', 'transform', 'load', 'run-pipeline', 'schedule', 'validate']).describe('ETL action'),
  pipelineName: z.string().optional().describe('Pipeline name'),
  source: z.object({
    type: z.enum(['csv', 'json', 'xml', 'database', 'api', 's3']),
    connection: z.string().optional(),
    path: z.string().optional(),
    query: z.string().optional()
  }).optional().describe('Data source configuration'),
  destination: z.object({
    type: z.enum(['csv', 'json', 'database', 's3', 'bigquery']),
    connection: z.string().optional(),
    path: z.string().optional(),
    table: z.string().optional()
  }).optional().describe('Data destination configuration'),
  transformations: z.array(z.object({
    type: z.string(),
    config: z.record(z.any())
  })).optional().describe('Transformations to apply'),
  schedule: z.string().optional().describe('Cron schedule expression')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  pipelineId: z.string().optional(),
  status: z.string().optional(),
  rowsProcessed: z.number().int().optional(),
  rowsFailed: z.number().int().optional(),
  duration: z.string().optional(),
  outputPath: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
