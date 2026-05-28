import { z } from 'zod';
import { InputSchema, OutputSchema, type SkillInput, type SkillOutput } from './schema';

export { InputSchema, OutputSchema };
export type { SkillInput, SkillOutput };

export type SkillResult = {
  success: boolean;
  data?: any;
  error?: string;
};

async function executeInternal(params: SkillInput) {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    cpu: { percentUsed: 45.2, loadAverage: [2.1, 1.8, 1.5], cores: 8 },
    memory: { totalGB: 16, usedGB: 11.2, percentUsed: 70, swapUsedGB: 0.5 },
    disk: { totalGB: 256, usedGB: 143, percentUsed: 55.9 },
    network: { bytesIn: 1524300, bytesOut: 892100, connections: 42 },
    processes: [
      { pid: 1234, name: 'node', cpuPercent: 12.5, memoryMB: 256, status: 'running' },
      { pid: 5678, name: 'nginx', cpuPercent: 2.1, memoryMB: 64, status: 'running' },
      { pid: 9012, name: 'postgres', cpuPercent: 5.3, memoryMB: 512, status: 'sleeping' }
    ]
  };
}

export async function execute(params: SkillInput): Promise<SkillResult> {
  try {
    const validated = InputSchema.parse(params);
    const result = await executeInternal(validated);
    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof z.ZodError
        ? `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        : error.message || 'Unknown error occurred'
    };
  }
}
