import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askOpenAI(systemPrompt: string, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 1024,
  });
  return res.choices[0]?.message?.content ?? '';
}
