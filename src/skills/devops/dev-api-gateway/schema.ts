import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['create-route', 'list-routes', 'delete-route', 'set-rate-limit', 'add-auth', 'deploy']).describe('Gateway action'),
  routePath: z.string().describe('API route path (e.g. /api/v1/users)'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY']).default('ANY').describe('HTTP method'),
  targetUrl: z.string().url().optional().describe('Upstream target URL'),
  rateLimit: z.object({
    requestsPerSecond: z.number().int().positive().optional(),
    burstSize: z.number().int().positive().optional()
  }).optional().describe('Rate limiting configuration'),
  authType: z.enum(['none', 'api-key', 'jwt', 'oauth2', 'basic']).optional().describe('Authentication type'),
  gatewayName: z.string().optional().describe('Gateway name'),
  cors: z.object({
    origins: z.array(z.string()).optional(),
    methods: z.array(z.string()).optional(),
    headers: z.array(z.string()).optional()
  }).optional().describe('CORS configuration'),
  plugin: z.string().optional().describe('Plugin name (e.g. "prometheus", "logging")')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  routeId: z.string().optional(),
  routes: z.array(z.object({
    id: z.string(),
    path: z.string(),
    method: z.string(),
    target: z.string(),
    auth: z.string(),
    rateLimit: z.string().optional()
  })).optional(),
  endpoint: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
