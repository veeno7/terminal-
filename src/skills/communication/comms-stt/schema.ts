import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['transcribe', 'transcribe-file', 'identify-speaker', 'list-models']).describe('STT action'),
  audioPath: z.string().optional().describe('Path to audio file'),
  audioUrl: z.string().optional().describe('URL to audio file'),
  languageCode: z.string().default('en-US').describe('Language code'),
  model: z.string().default('whisper-1').describe('STT model name'),
  enableDiarization: z.boolean().default(false).describe('Enable speaker diarization'),
  maxSpeakers: z.number().int().min(2).max(10).default(2).describe('Maximum number of speakers'),
  punctuation: z.boolean().default(true).describe('Enable punctuation'),
  format: z.enum(['wav', 'mp3', 'ogg', 'flac', 'm4a']).default('wav').describe('Audio format'),
  sampleRate: z.number().int().default(16000).describe('Sample rate in Hz')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  text: z.string().optional(),
  segments: z.array(z.object({
    startTime: z.number(),
    endTime: z.number(),
    text: z.string(),
    speaker: z.string().optional(),
    confidence: z.number()
  })).optional(),
  durationMs: z.number().int().optional(),
  speakers: z.array(z.string()).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
