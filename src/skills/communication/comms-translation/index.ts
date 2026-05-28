export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const text = params.text as string ?? '';
    const target = params.target as string ?? 'en';
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && text) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: `Translate to ${target}, reply with only the translation: "${text}"` }] }),
      });
      const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const translated = json.choices?.[0]?.message?.content ?? '';
      return { success: true, data: { original: text, translated, source: params.source ?? 'auto', target } };
    }
    return { success: true, data: { original: text, translated: text, target, note: 'Set OPENAI_API_KEY for real translation.' } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
