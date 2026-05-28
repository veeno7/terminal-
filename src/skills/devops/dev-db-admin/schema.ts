import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['query', 'migrate', 'backup', 'restore', 'list-tables', 'describe-table', 'create-table', 'optimize']).describe('Database action'),
  databaseType: z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb', 'redis']).default('sqlite').describe('Database type'),
  connectionString: z.string().optional().describe('Database connection string'),
  database: z.string().optional().describe('Database name'),
  query: z.string().optional().describe('SQL query to execute'),
  tableName: z.string().optional().describe('Table name'),
  schema: z.string().optional().describe('CREATE TABLE statement or migration SQL'),
  backupPath: z.string().optional().describe('Path for backup file'),
  restorePath: z.string().optional().describe('Path to backup file for restore')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  rows: z.array(z.record(z.any())).optional(),
  rowCount: z.number().int().optional(),
  columns: z.array(z.object({
    name: z.string(),
    type: z.string()
  })).optional(),
  tables: z.array(z.string()).optional(),
  backupFile: z.string().optional(),
  executionTime: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
