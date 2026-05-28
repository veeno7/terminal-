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
    case 'upload':
      return {
        success: true,
        fileId: `file_${params.provider}_${Date.now()}`,
        downloadUrl: `https://${params.provider}.com/file/${Date.now()}`
      };
    case 'download':
      return {
        success: true,
        fileId: `file_${Date.now()}`,
        downloadUrl: `https://${params.provider}.com/dl/${Date.now()}`
      };
    case 'list':
      return {
        success: true,
        files: Array.from({ length: Math.min(params.maxResults || 20, 10) }, (_, i) => ({
          id: `f_${i}_${Date.now()}`,
          name: `file_${i + 1}.${['txt', 'pdf', 'jpg', 'png', 'docx'][i % 5]}`,
          mimeType: `application/${['octet-stream', 'pdf', 'jpeg', 'png', 'vnd.openxmlformats-officedocument.wordprocessingml.document'][i % 5]}`,
          size: (i + 1) * 1024 * 10,
          modifiedAt: new Date(Date.now() - i * 86400000).toISOString(),
          path: `${params.folder}/file_${i + 1}`
        }))
      };
    case 'delete':
      return { success: true };
    case 'share':
      return {
        success: true,
        fileId: `file_${Date.now()}`,
        sharedWith: params.shareWith,
        permission: params.permission || 'reader'
      };
    case 'search':
      return {
        success: true,
        files: []
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
