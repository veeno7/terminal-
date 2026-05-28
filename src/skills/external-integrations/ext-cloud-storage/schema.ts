import { z } from 'zod';

export const InputSchema = z.object({
  provider: z.enum(['gdrive', 'dropbox', 's3']).describe('Cloud storage provider'),
  action: z.enum(['upload', 'download', 'list', 'delete', 'share', 'search']).describe('Storage action'),
  filePath: z.string().optional().describe('Local file path for upload/download'),
  remotePath: z.string().optional().describe('Remote path in cloud storage'),
  fileName: z.string().optional().describe('File name'),
  mimeType: z.string().optional().describe('MIME type of the file'),
  folder: z.string().default('/').describe('Cloud folder path'),
  maxResults: z.number().int().positive().default(20).describe('Max files to list'),
  query: z.string().optional().describe('Search query'),
  shareWith: z.string().email().optional().describe('Email to share with'),
  permission: z.enum(['reader', 'commenter', 'writer']).optional().describe('Sharing permission level')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  fileId: z.string().optional(),
  downloadUrl: z.string().optional(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    mimeType: z.string(),
    size: z.number().int(),
    modifiedAt: z.string(),
    path: z.string()
  })).optional(),
  totalSize: z.number().int().optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
