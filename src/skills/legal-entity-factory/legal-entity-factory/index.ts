export type SkillResult = { success: boolean; data?: unknown; error?: string };

export async function execute(params: Record<string, unknown>): Promise<SkillResult> {
  try {
    const docType = params.type as string ?? 'nda';
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const prompt = `Generate a professional ${docType} legal document template for: ${JSON.stringify(params)}. Be thorough and use standard legal language.`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
      });
      const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content ?? '';
      return { success: true, data: { type: docType, document: content, generated: true } };
    }
    return { success: true, data: { type: docType, document: `[${docType.toUpperCase()} TEMPLATE]\n\nThis is a placeholder. Set OPENAI_API_KEY for AI-generated legal documents.`, generated: false } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
