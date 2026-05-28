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
    case 'send-message':
      return {
        success: true,
        messageId: `msg_${params.platform}_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    case 'read-channel':
      return {
        success: true,
        messages: Array.from({ length: Math.min(params.limit || 50, 10) }, (_, i) => ({
          id: `msg_${i}_${Date.now()}`,
          user: `user${i}`,
          text: `Sample message ${i + 1} from ${params.platform}`,
          timestamp: new Date(Date.now() - i * 60000).toISOString()
        }))
      };
    case 'list-channels':
      return {
        success: true,
        channels: [
          { id: 'general', name: 'general', topic: 'General discussion', memberCount: 42 },
          { id: 'random', name: 'random', topic: 'Random stuff', memberCount: 38 },
          { id: 'dev', name: 'development', topic: 'Dev chat', memberCount: 15 }
        ]
      };
    case 'create-webhook':
      return {
        success: true,
        webhookUrl: `https://hooks.${params.platform}.com/services/${Date.now()}`
      };
    case 'add-reaction':
      return {
        success: true,
        reaction: params.reaction,
        channel: params.channel
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
