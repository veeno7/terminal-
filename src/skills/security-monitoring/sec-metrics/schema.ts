import { z } from 'zod';

export const InputSchema = z.object({
  metricType: z.enum(['cpu', 'memory', 'disk', 'network', 'processes', 'all']).default('all').describe('Type of metrics to collect'),
  interval: z.number().int().positive().default(1000).describe('Sampling interval in ms'),
  duration: z.number().int().positive().default(5000).describe('Collection duration in ms'),
  processFilter: z.string().optional().describe('Filter processes by name')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
  cpu: z.object({
    percentUsed: z.number(),
    loadAverage: z.array(z.number()),
    cores: z.number().int()
  }).optional(),
  memory: z.object({
    totalGB: z.number(),
    usedGB: z.number(),
    percentUsed: z.number(),
    swapUsedGB: z.number().optional()
  }).optional(),
  disk: z.object({
    totalGB: z.number(),
    usedGB: z.number(),
    percentUsed: z.number()
  }).optional(),
  network: z.object({
    bytesIn: z.number(),
    bytesOut: z.number(),
    connections: z.number().int().optional()
  }).optional(),
  processes: z.array(z.object({
    pid: z.number().int(),
    name: z.string(),
    cpuPercent: z.number(),
    memoryMB: z.number(),
    status: z.string()
  })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
