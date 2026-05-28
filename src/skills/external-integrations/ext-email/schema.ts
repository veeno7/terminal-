import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['send', 'read', 'list', 'search']).describe('Email action to perform'),
  to: z.array(z.string().email()).optional().describe('Recipient email addresses'),
  subject: z.string().optional().describe('Email subject line'),
  body: z.string().optional().describe('Email body content (plain text or HTML)'),
  from: z.string().email().optional().describe('Sender email address'),
  cc: z.array(z.string().email()).optional().describe('CC recipients'),
  bcc: z.array(z.string().email()).optional().describe('BCC recipients'),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    encoding: z.string().optional()
  })).optional().describe('Email attachments'),
  folder: z.string().optional().describe('Folder to read from (inbox, sent, spam)'),
  maxResults: z.number().int().positive().default(10).describe('Max results for list/search'),
  query: z.string().optional().describe('Search query for searching emails')
});

export const OutputSchema = z.object({
  messageId: z.string().optional(),
  sent: z.boolean().default(false),
  emails: z.array(z.object({
    id: z.string(),
    from: z.string(),
    to: z.array(z.string()),
    subject: z.string(),
    body: z.string(),
    date: z.string(),
    read: z.boolean()
  })).optional(),
  totalCount: z.number().int().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
