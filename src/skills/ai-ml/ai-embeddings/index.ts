export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const text = params.text as string ?? '';
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && text) {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
      });
      const json = await res.json() as { data?: Array<{ embedding: number[] }> };
      const embedding = json.data?.[0]?.embedding ?? [];
      return { success: true, data: { text, dimensions: embedding.length, embedding: embedding.slice(0, 5), note: 'Showing first 5 of ' + embedding.length + ' dimensions.' } };
    }
    return { success: true, data: { text, dimensions: 0, note: 'Set OPENAI_API_KEY for real embeddings.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
