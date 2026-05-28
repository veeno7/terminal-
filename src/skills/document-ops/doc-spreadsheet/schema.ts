import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete', 'add-sheet', 'format', 'chart']).describe('Spreadsheet action'),
  filePath: z.string().optional().describe('Path to spreadsheet file'),
  sheetName: z.string().default('Sheet1').describe('Worksheet name'),
  range: z.string().optional().describe('Cell range (e.g. "A1:C10")'),
  data: z.array(z.array(z.any())).optional().describe('Data to write'),
  headers: z.array(z.string()).optional().describe('Column headers'),
  chartType: z.enum(['bar', 'line', 'pie', 'scatter']).optional().describe('Chart type'),
  dataRange: z.string().optional().describe('Data range for chart'),
  format: z.object({ bold: z.boolean().optional(), italic: z.boolean().optional(), fontSize: z.number().int().optional(), bgColor: z.string().optional() }).optional()
});

export const OutputSchema = z.object({
  success: z.boolean(),
  rows: z.array(z.record(z.any())).optional(),
  rowCount: z.number().int().optional(),
  sheets: z.array(z.string()).optional(),
  filePath: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
