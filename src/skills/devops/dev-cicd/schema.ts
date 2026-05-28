import { z } from 'zod';

export const InputSchema = z.object({
  platform: z.enum(['github-actions', 'gitlab-ci']).describe('CI/CD platform'),
  action: z.enum(['trigger', 'status', 'list', 'cancel', 'create-workflow', 'get-logs']).describe('Pipeline action'),
  repo: z.string().describe('Repository (owner/name)'),
  workflowId: z.string().optional().describe('Workflow file name or ID'),
  branch: z.string().default('main').describe('Branch to run on'),
  ref: z.string().optional().describe('Git ref (commit SHA, tag)'),
  inputs: z.record(z.string()).optional().describe('Workflow dispatch inputs'),
  runId: z.number().int().optional().describe('Specific run ID for status/logs')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  runId: z.number().int().optional(),
  status: z.string().optional(),
  conclusion: z.string().optional(),
  htmlUrl: z.string().optional(),
  workflows: z.array(z.object({
    id: z.number().int(),
    name: z.string(),
    status: z.string(),
    branch: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })).optional(),
  logs: z.string().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
