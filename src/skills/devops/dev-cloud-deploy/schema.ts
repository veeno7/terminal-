import { z } from 'zod';

export const InputSchema = z.object({
  provider: z.enum(['aws', 'gcp', 'azure']).describe('Cloud provider'),
  action: z.enum(['list-instances', 'create-instance', 'stop-instance', 'terminate-instance', 'list-buckets', 'create-bucket', 'deploy-function', 'list-functions']).describe('Cloud action'),
  instanceName: z.string().optional().describe('Instance name'),
  instanceType: z.string().optional().describe('Instance type (e.g. t3.micro, e2-small)'),
  region: z.string().default('us-east-1').describe('Cloud region'),
  bucketName: z.string().optional().describe('Storage bucket name'),
  functionName: z.string().optional().describe('Function name (serverless)'),
  runtime: z.string().optional().describe('Runtime (nodejs18.x, python3.11)'),
  sourcePath: z.string().optional().describe('Path to deployment source code'),
  environment: z.record(z.string()).optional().describe('Environment variables'),
  tags: z.record(z.string()).optional().describe('Resource tags')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  instances: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    state: z.string(),
    publicIp: z.string().optional(),
    region: z.string(),
    launched: z.string()
  })).optional(),
  instanceId: z.string().optional(),
  bucketName: z.string().optional(),
  functionName: z.string().optional(),
  endpoint: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
