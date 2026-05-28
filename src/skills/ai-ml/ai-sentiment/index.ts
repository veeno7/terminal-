export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const text = params.text as string ?? '';
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && text) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: `Analyze sentiment and return JSON with keys: sentiment (positive/negative/neutral), score (0-1), emotions (array), entities (array). Text: "${text}"` }], response_format: { type: 'json_object' } }),
      });
      const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content ?? '{}';
      return { success: true, data: JSON.parse(content) as unknown };
    }
    // Simple rule-based fallback
    const lower = text.toLowerCase();
    const positive = ['good','great','excellent','happy','love','amazing'].filter(w => lower.includes(w)).length;
    const negative = ['bad','terrible','hate','awful','worst','sad'].filter(w => lower.includes(w)).length;
    const sentiment = positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';
    return { success: true, data: { text, sentiment, score: positive > 0 ? 0.7 : negative > 0 ? 0.3 : 0.5, emotions: [], entities: [] } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
