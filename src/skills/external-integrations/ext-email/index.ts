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
  // Mock implementation - real SMTP/Gmail API integration
  switch (params.action) {
    case 'send':
      return {
        messageId: `msg_${Date.now()}`,
        sent: true,
        to: params.to,
        subject: params.subject,
        timestamp: new Date().toISOString()
      };
    case 'read':
      return {
        emails: Array.from({ length: Math.min(params.maxResults || 10, 10) }, (_, i) => ({
          id: `email_${i}_${Date.now()}`,
          from: `sender${i}@example.com`,
          to: ['recipient@example.com'],
          subject: `Sample Email Subject ${i + 1}`,
          body: `This is the body of email ${i + 1}.`,
          date: new Date(Date.now() - i * 3600000).toISOString(),
          read: i < 3
        })),
        totalCount: 42
      };
    case 'list':
      return {
        emails: [],
        totalCount: 0
      };
    case 'search':
      return {
        emails: [],
        totalCount: 0,
        query: params.query
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
