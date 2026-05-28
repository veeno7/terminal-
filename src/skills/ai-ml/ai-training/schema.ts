import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['train', 'fine-tune', 'evaluate', 'list-models', 'cancel-training']).describe('Training action'),
  modelType: z.enum(['classification', 'regression', 'nlp', 'vision', 'llm']).default('classification').describe('Type of model'),
  modelName: z.string().optional().describe('Base model name or path'),
  trainingData: z.string().describe('Path or URL to training data'),
  validationData: z.string().optional().describe('Path or URL to validation data'),
  testData: z.string().optional().describe('Path or URL to test data'),
  hyperparameters: z.record(z.any()).optional().describe('Training hyperparameters'),
  epochs: z.number().int().positive().default(10).describe('Number of training epochs'),
  batchSize: z.number().int().positive().default(32).describe('Batch size'),
  learningRate: z.number().positive().default(0.001).describe('Learning rate'),
  targetMetric: z.string().default('accuracy').describe('Target optimization metric'),
  framework: z.enum(['pytorch', 'tensorflow', 'sklearn', 'transformers']).default('pytorch').describe('ML framework'),
  outputDir: z.string().optional().describe('Output directory for model artifacts')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  modelId: z.string().optional(),
  trainingRunId: z.string().optional(),
  status: z.string().optional(),
  metrics: z.object({
    accuracy: z.number().optional(),
    loss: z.number().optional(),
    f1Score: z.number().optional(),
    precision: z.number().optional(),
    recall: z.number().optional()
  }).optional(),
  epochsCompleted: z.number().int().optional(),
  modelPath: z.string().optional(),
  duration: z.string().optional(),
  models: z.array(z.object({ id: z.string(), name: z.string(), framework: z.string(), status: z.string() })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
