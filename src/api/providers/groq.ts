import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGroq(systemPrompt: string, messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const res = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 1024,
  });
  return res.choices[0]?.message?.content ?? '';
}
