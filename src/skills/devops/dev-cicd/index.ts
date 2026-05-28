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
  switch (params.action) {
    case 'trigger':
      return {
        success: true,
        runId: Math.floor(Math.random() * 1000000),
        status: 'queued',
        htmlUrl: `https://${params.platform === 'github-actions' ? 'github.com' : 'gitlab.com'}/${params.repo}/actions/runs/${Date.now()}`
      };
    case 'status':
      return {
        success: true,
        runId: params.runId || Math.floor(Math.random() * 1000000),
        status: 'completed',
        conclusion: 'success',
        htmlUrl: `https://github.com/${params.repo}/actions/runs/${params.runId || Date.now()}`
      };
    case 'list':
      return {
        success: true,
        workflows: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: [`CI ${params.repo}`, 'Deploy', 'Lint', 'Test', 'Release'][i],
          status: ['completed', 'completed', 'completed', 'failed', 'running'][i],
          branch: ['main', 'main', 'develop', 'feature/test', 'main'][i],
          createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - i * 3600000).toISOString()
        }))
      };
    case 'cancel':
      return { success: true, runId: params.runId || 0, status: 'cancelled' };
    case 'create-workflow':
      return {
        success: true,
        workflowId: params.workflowId || 'custom.yml',
        htmlUrl: `https://github.com/${params.repo}/blob/main/.github/workflows/${params.workflowId || 'custom.yml'}`
      };
    case 'get-logs':
      return {
        success: true,
        logs: '[2024-01-01T00:00:00Z] Starting job...\n[2024-01-01T00:00:05Z] Checkout complete\n[2024-01-01T00:00:10Z] Build complete\n[2024-01-01T00:00:15Z] Tests passed\n[2024-01-01T00:00:20Z] Deployment successful'
      };
    default:
      throw new Error(`Unknown action: ${params.action}`);
  }
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
