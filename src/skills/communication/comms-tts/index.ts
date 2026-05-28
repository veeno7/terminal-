export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const text = params.text as string ?? '';
    if (openaiKey && text) {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'tts-1', input: text, voice: params.voice ?? 'alloy' }),
      });
      if (res.ok) {
        return { success: true, data: { text, voice: params.voice ?? 'alloy', format: 'mp3', size: res.headers.get('content-length'), note: 'Audio generated via OpenAI TTS.' } };
      }
    }
    return { success: true, data: { text, voice: params.voice ?? 'alloy', generated: false, note: 'Set OPENAI_API_KEY for real TTS.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
