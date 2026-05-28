export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    return { success: true, data: { transcript: '', speakers: [], language: params.language ?? 'en', confidence: 0, note: 'Provide an audio file path and set OPENAI_API_KEY for real transcription via Whisper.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
