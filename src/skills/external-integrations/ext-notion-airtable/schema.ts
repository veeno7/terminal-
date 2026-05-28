import { z } from 'zod';

export const InputSchema = z.object({
  platform: z.enum(['notion', 'airtable']).describe('No-code platform'),
  action: z.enum(['query', 'create', 'update', 'delete', 'list-databases']).describe('Database action'),
  databaseId: z.string().optional().describe('Database/Base ID'),
  tableName: z.string().optional().describe('Table name (Airtable)'),
  recordId: z.string().optional().describe('Record ID for update/delete'),
  fields: z.record(z.any()).optional().describe('Fields/columns to create or update'),
  filter: z.string().optional().describe('Filter formula (Airtable) or Notion filter JSON'),
  sorts: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  })).optional().describe('Sort specifications'),
  maxResults: z.number().int().positive().default(100).describe('Max records to return')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  records: z.array(z.object({
    id: z.string(),
    fields: z.record(z.any()),
    createdTime: z.string().optional(),
    url: z.string().optional()
  })).optional(),
  record: z.object({
    id: z.string(),
    fields: z.record(z.any())
  }).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
