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
    case 'query':
      return {
        success: true,
        records: Array.from({ length: Math.min(params.maxResults || 100, 5) }, (_, i) => ({
          id: `rec_${i}_${Date.now()}`,
          fields: {
            Name: `Record ${i + 1}`,
            Status: ['Active', 'Pending', 'Completed'][i % 3],
            Created: new Date(Date.now() - i * 86400000).toISOString()
          },
          createdTime: new Date(Date.now() - i * 86400000).toISOString(),
          url: `https://${params.platform}.com/${params.databaseId || 'db'}/${i}`
        }))
      };
    case 'create':
      return {
        success: true,
        record: {
          id: `rec_${Date.now()}`,
          fields: params.fields || {}
        }
      };
    case 'update':
      return {
        success: true,
        record: {
          id: params.recordId || `rec_${Date.now()}`,
          fields: params.fields || {}
        }
      };
    case 'delete':
      return { success: true };
    case 'list-databases':
      return {
        success: true,
        records: [
          { id: 'db1', fields: { Name: 'Projects', Type: 'Database' } },
          { id: 'db2', fields: { Name: 'Tasks', Type: 'Database' } }
        ]
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
