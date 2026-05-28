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
    case 'create':
      return {
        success: true,
        event: {
          id: `evt_${Date.now()}`,
          title: params.title || 'Untitled Event',
          startTime: params.startTime || new Date().toISOString(),
          endTime: params.endTime || new Date(Date.now() + 3600000).toISOString(),
          description: params.description,
          location: params.location,
          attendees: params.attendees,
          htmlLink: `https://calendar.google.com/event?eid=${Date.now()}`
        }
      };
    case 'list':
      return {
        success: true,
        events: Array.from({ length: Math.min(params.maxResults || 10, 10) }, (_, i) => ({
          id: `evt_${i}_${Date.now()}`,
          title: `Event ${i + 1}`,
          startTime: new Date(Date.now() + i * 86400000).toISOString(),
          endTime: new Date(Date.now() + i * 86400000 + 3600000).toISOString()
        }))
      };
    case 'update':
      return {
        success: true,
        event: {
          id: params.eventId || `evt_${Date.now()}`,
          title: params.title || 'Updated Event',
          startTime: params.startTime || new Date().toISOString(),
          endTime: params.endTime || new Date(Date.now() + 3600000).toISOString()
        }
      };
    case 'delete':
      return { success: true };
    case 'find-free':
      return {
        success: true,
        freeSlots: [
          { start: new Date().toISOString(), end: new Date(Date.now() + 7200000).toISOString() }
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
