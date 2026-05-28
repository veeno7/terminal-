import Groq from 'groq-sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class ModelService {
  private groq: Groq;
  private openai: OpenAI;
  private isGroqMock: boolean = false;
  private isOpenAIMock: boolean = false;

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!groqKey) {
      console.warn('[ModelService] GROQ_API_KEY missing. Using mock mode for fast reasoning.');
      this.isGroqMock = true;
    }
    if (!openaiKey) {
      console.warn('[ModelService] OPENAI_API_KEY missing. Using mock mode for deep reasoning.');
      this.isOpenAIMock = true;
    }

    this.groq = new Groq({ apiKey: groqKey || 'mock-key' });
    this.openai = new OpenAI({ apiKey: openaiKey || 'mock-key' });
  }

  // Fast/default reasoning (Groq - fast responses)
  async fastReasoning(prompt: string, context?: string): Promise<string> {
    if (this.isGroqMock) {
      return `[Mock Groq] Reasoning about: ${prompt.substring(0, 50)}...`;
    }

    const start = Date.now();
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: `You are a fast, efficient cognitive subsystem. Context: ${context || 'None'}` },
          { role: 'user', content: prompt }
        ],
        model: ''llama-3.1-8b-instant,
      });
      const duration = Date.now() - start;
      console.log(`[ModelService] Groq call took ${duration}ms`);
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ModelService] Groq API error:', error);
      return `Error in fast reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Deep reasoning (OpenAI - complex planning)
  async deepReasoning(prompt: string, context?: string): Promise<string> {
    if (this.isOpenAIMock) {
      return `[Mock OpenAI] Deep planning for: ${prompt.substring(0, 50)}...`;
    }

    const start = Date.now();
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: `You are an expert cognitive architect and planner. Context: ${context || 'None'}` },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4o', 
      });
      const duration = Date.now() - start;
      console.log(`[ModelService] OpenAI call took ${duration}ms`);
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ModelService] OpenAI API error:', error);
      return `Error in deep reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
