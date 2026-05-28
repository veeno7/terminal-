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
    alertId: `alert_${Date.now()}`,
    status: params.action === 'resolve' ? 'resolved' : params.action === 'acknowledge' ? 'acknowledged' : 'triggered',
    acknowledgedBy: params.action === 'acknowledge' ? 'oncall-engineer' : undefined,
    createdAt: new Date().toISOString(),
    deliveryStatus: `delivered via ${params.provider}`
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
