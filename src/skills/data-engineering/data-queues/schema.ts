import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['enqueue', 'process', 'schedule', 'pause', 'resume', 'get-status', 'list-queues']).describe('Queue action'),
  queueName: z.string().describe('Queue name'),
  jobData: z.record(z.any()).optional().describe('Job payload data'),
  jobId: z.string().optional().describe('Specific job ID'),
  schedule: z.string().optional().describe('Cron schedule'),
  priority: z.number().int().min(1).max(100).default(50).describe('Job priority (1=highest)'),
  delay: z.number().int().min(0).default(0).describe('Delay in ms'),
  retries: z.number().int().min(0).default(3).describe('Max retry attempts'),
  concurrency: z.number().int().positive().default(5).describe('Processing concurrency')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  jobId: z.string().optional(),
  queueName: z.string(),
  status: z.string().optional(),
  stats: z.object({
    waiting: z.number().int(),
    active: z.number().int(),
    completed: z.number().int(),
    failed: z.number().int(),
    delayed: z.number().int()
  }).optional(),
  jobs: z.array(z.object({ id: z.string(), data: z.any(), status: z.string(), attempts: z.number().int(), timestamp: z.string() })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
