import { z } from 'zod';

export const InputSchema = z.object({
  action: z.enum(['detect-objects', 'classify-image', 'generate-thumbnail', 'transcode-video', 'extract-audio', 'lip-sync', 'resize-image', 'filter-image', 'analyze-video']).describe('Media action'),
  inputPath: z.string().describe('Input media file path or URL'),
  outputPath: z.string().optional().describe('Output file path'),
  operations: z.array(z.object({
    type: z.string(),
    params: z.record(z.any())
  })).optional().describe('Media operations pipeline'),
  format: z.string().optional().describe('Output format (mp4, webm, jpg, png, mp3, wav)'),
  quality: z.number().min(1).max(100).default(80).describe('Output quality'),
  width: z.number().int().positive().optional().describe('Output width'),
  height: z.number().int().positive().optional().describe('Output height'),
  fps: z.number().positive().optional().describe('Frames per second'),
  audioBitrate: z.string().optional().describe('Audio bitrate (e.g. 128k)'),
  videoBitrate: z.string().optional().describe('Video bitrate (e.g. 2M)'),
  textOverlay: z.string().optional().describe('Text to overlay on media'),
  confidence: z.number().min(0).max(1).default(0.5).describe('Detection confidence threshold'),
  lipSyncAudio: z.string().optional().describe('Audio file for lip-sync')
});

export const OutputSchema = z.object({
  success: z.boolean(),
  outputPath: z.string().optional(),
  fileSize: z.number().int().optional(),
  durationMs: z.number().int().optional(),
  detections: z.array(z.object({ label: z.string(), confidence: z.number(), bbox: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }) })).optional(),
  labels: z.array(z.object({ label: z.string(), confidence: z.number() })).optional(),
  thumbnailPath: z.string().optional(),
  metrics: z.object({ width: z.number().int(), height: z.number().int(), fps: z.number(), bitrate: z.string() }).optional()
});

export type SkillInput = z.infer<typeof InputSchema>;
export type SkillOutput = z.infer<typeof OutputSchema>;
