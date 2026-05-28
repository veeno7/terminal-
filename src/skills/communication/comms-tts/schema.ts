import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['synthesize', 'clone-voice', 'list-voices']).describe('TTS action'),
  text: z.string().describe('Text to synthesize'),
  voice: z.string().default('en-US-Neural2-F').describe('Voice ID or name'),
  languageCode: z.string().default('en-US').describe('Language code'),
  speed: z.number().min(0.5).max(2.0).default(1.0).describe('Speech speed multiplier'),
  pitch: z.number().min(-20).max(20).default(0).describe('Pitch adjustment in semitones'),
  format: z.enum(['mp3', 'wav', 'ogg', 'flac']).default('mp3').describe('Audio format'),
  outputPath: z.string().optional().describe('Output file path'),
  ssml: z.string().optional().describe('SSML markup (overrides text)'),
  voiceSamples: z.array(z.string()).optional().describe('Voice samples for cloning')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  audioUrl: z.string().optional(),
  durationMs: z.number().int().optional(),
  fileSize: z.number().int().optional(),
  format: z.string().optional(),
  voices: z.array(z.object({ id: z.string(), name: z.string(), language: z.string(), gender: z.string() })).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
