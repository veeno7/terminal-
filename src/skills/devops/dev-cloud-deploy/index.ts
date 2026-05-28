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
    case 'list-instances':
      return {
        success: true,
        instances: [
          { id: 'i-abc123', name: 'web-server', type: 't3.medium', state: 'running', publicIp: '54.123.45.67', region: params.region, launched: '30 days ago' },
          { id: 'i-def456', name: 'db-server', type: 't3.large', state: 'stopped', region: params.region, launched: '60 days ago' }
        ]
      };
    case 'create-instance':
      return {
        success: true,
        instanceId: `i-${params.provider}_${Date.now()}`,
        publicIp: `54.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      };
    case 'stop-instance':
      return { success: true, instanceId: params.instanceName || 'i-unknown', state: 'stopping' };
    case 'terminate-instance':
      return { success: true, instanceId: params.instanceName || 'i-unknown', state: 'terminated' };
    case 'list-buckets':
      return { success: true, buckets: [{ name: 'my-app-data', created: '2024-01-15' }, { name: 'logs-archive', created: '2024-03-01' }] };
    case 'create-bucket':
      return { success: true, bucketName: params.bucketName || `bucket-${Date.now()}` };
    case 'deploy-function':
      return {
        success: true,
        functionName: params.functionName || 'my-function',
        endpoint: `https://${params.region}-project.cloudfunctions.net/${params.functionName || 'my-function'}`
      };
    case 'list-functions':
      return {
        success: true,
        functions: [{ name: 'process-orders', runtime: 'nodejs18', status: 'active' }, { name: 'send-emails', runtime: 'python311', status: 'active' }]
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
