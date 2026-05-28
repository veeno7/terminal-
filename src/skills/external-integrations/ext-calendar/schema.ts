import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['create', 'list', 'update', 'delete', 'find-free']).describe('Calendar action'),
  title: z.string().optional().describe('Event title'),
  description: z.string().optional().describe('Event description'),
  startTime: z.string().datetime().optional().describe('Start time (ISO 8601)'),
  endTime: z.string().datetime().optional().describe('End time (ISO 8601)'),
  attendees: z.array(z.string().email()).optional().describe('Attendee emails'),
  location: z.string().optional().describe('Event location'),
  calendarId: z.string().optional().describe('Calendar ID (default: primary)'),
  eventId: z.string().optional().describe('Event ID (for update/delete)'),
  timeMin: z.string().datetime().optional().describe('Start of search range'),
  timeMax: z.string().datetime().optional().describe('End of search range'),
  maxResults: z.number().int().positive().default(10).describe('Max events to return')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
    htmlLink: z.string().optional()
  }).optional(),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    startTime: z.string(),
    endTime: z.string()
  })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
