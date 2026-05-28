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
    case 'create-route':
      return {
        success: true,
        routeId: `route_${Date.now()}`,
        endpoint: `https://gateway.local${params.routePath}`
      };
    case 'list-routes':
      return {
        success: true,
        routes: [
          { id: 'r1', path: '/api/v1/users', method: 'GET', target: 'http://users-service:3001', auth: 'jwt', rateLimit: '100/s' },
          { id: 'r2', path: '/api/v1/orders', method: 'POST', target: 'http://orders-service:3002', auth: 'jwt', rateLimit: '50/s' },
          { id: 'r3', path: '/api/v1/auth', method: 'POST', target: 'http://auth-service:3003', auth: 'none' }
        ]
      };
    case 'delete-route':
      return { success: true, routeId: params.routePath || 'unknown' };
    case 'set-rate-limit':
      return { success: true, routePath: params.routePath, config: params.rateLimit };
    case 'add-auth':
      return { success: true, routePath: params.routePath, authType: params.authType || 'jwt' };
    case 'deploy':
      return { success: true, endpoint: `https://${params.gatewayName || 'api'}.gateway.local`, version: `v1.0.0-${Date.now()}` };
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
