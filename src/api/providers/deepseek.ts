import OpenAI from 'openai';

// DeepSeek uses OpenAI-compatible API
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export async function askDeepSeek(systemPrompt: string, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const res = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 1024,
  });
  return res.choices[0]?.message?.content ?? '';
}
