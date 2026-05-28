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
    case 'list-containers':
      return {
        success: true,
        containers: [
          { id: 'abc123', name: 'web-app', image: 'nginx:latest', status: 'running', ports: '0.0.0.0:80->80/tcp', created: '2 days ago' },
          { id: 'def456', name: 'api-server', image: 'node:18', status: 'running', ports: '0.0.0.0:3000->3000/tcp', created: '5 days ago' },
          { id: 'ghi789', name: 'redis-cache', image: 'redis:7', status: 'exited', created: '1 week ago' }
        ]
      };
    case 'start':
    case 'stop':
      return { success: true, containerId: params.containerId || 'abc123', status: params.action === 'start' ? 'running' : 'exited' };
    case 'exec':
      return { success: true, output: `$ ${params.command}\nOutput from container ${params.containerId}` };
    case 'build':
      return { success: true, imageName: `${params.imageName || 'app'}:${params.imageTag}`, containerId: 'img_' + Date.now() };
    case 'push':
      return { success: true, imageName: params.imageName, status: 'pushed' };
    case 'list-images':
      return {
        success: true,
        images: [
          { id: 'sha256:abc...', repository: 'nginx', tag: 'latest', size: '142MB' },
          { id: 'sha256:def...', repository: 'node', tag: '18-alpine', size: '125MB' }
        ]
      };
    case 'compose-up':
      return { success: true, status: 'started', services: [params.serviceName || 'all'] };
    case 'compose-down':
      return { success: true, status: 'stopped' };
    case 'k8s-apply':
      return { success: true, status: 'applied', resource: params.k8sResourceType || 'deployment' };
    case 'k8s-get':
      return {
        success: true,
        resources: [
          { name: 'web-deploy', ready: '3/3', status: 'Running', restarts: 0, age: '5d' },
          { name: 'api-deploy', ready: '2/2', status: 'Running', restarts: 1, age: '5d' }
        ]
      };
    case 'k8s-logs':
      return { success: true, logs: '[INFO] Server started on port 8080\n[INFO] Connected to database' };
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
