import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['evaluate', 'latex', 'graph-theory', 'statistics', 'molecule', 'convert-units', 'plot']).describe('Math/Science action'),
  expression: z.string().optional().describe('Mathematical expression'),
  latexInput: z.string().optional().describe('LaTeX input to render'),
  dataset: z.array(z.number()).optional().describe('Dataset for statistical analysis'),
  graphEdges: z.array(z.object({ source: z.string(), target: z.string(), weight: z.number().optional() })).optional().describe('Graph edges'),
  graphDirected: z.boolean().default(false).describe('Whether graph is directed'),
  moleculeSmiles: z.string().optional().describe('SMILES notation for molecule'),
  value: z.number().optional().describe('Value to convert'),
  fromUnit: z.string().optional().describe('Source unit'),
  toUnit: z.string().optional().describe('Target unit'),
  statTests: z.array(z.enum(['t-test', 'chi-squared', 'correlation', 'anova'])).optional().describe('Statistical tests'),
  plotType: z.enum(['line', 'bar', 'scatter', 'histogram', '3d']).optional().describe('Plot type'),
  plotData: z.array(z.record(z.any())).optional().describe('Plot data points'),
  outputPath: z.string().optional().describe('Output file path')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  latexRendered: z.string().optional(),
  statistics: z.object({
    mean: z.number().optional(), median: z.number().optional(), stdDev: z.number().optional(),
    min: z.number().optional(), max: z.number().optional(), variance: z.number().optional()
  }).optional(),
  graphMetrics: z.object({ nodes: z.number().int(), edges: z.number().int(), density: z.number().optional(), components: z.number().int().optional() }).optional(),
  moleculeImage: z.string().optional(),
  plotPath: z.string().optional(),
  conversion: z.object({ value: z.number(), from: z.string(), to: z.string(), result: z.number() }).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
