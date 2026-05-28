import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class ModelService {
  private groq: Groq;
  private openai: OpenAI;
  private deepseek: OpenAI;
  private gemini: GoogleGenerativeAI | null = null;
  private isGroqMock: boolean = false;
  private isOpenAIMock: boolean = false;
  private isDeepSeekMock: boolean = false;
  private isGeminiMock: boolean = false;

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey) {
      console.warn('[ModelService] GROQ_API_KEY missing. Using mock mode.');
      this.isGroqMock = true;
    }
    if (!openaiKey) {
      console.warn('[ModelService] OPENAI_API_KEY missing. Using mock mode.');
      this.isOpenAIMock = true;
    }
    if (!deepseekKey) {
      console.warn('[ModelService] DEEPSEEK_API_KEY missing. Using mock mode.');
      this.isDeepSeekMock = true;
    }
    if (!geminiKey) {
      console.warn('[ModelService] GEMINI_API_KEY missing. Using mock mode.');
      this.isGeminiMock = true;
    }

    this.groq = new Groq({ apiKey: groqKey || 'mock-key' });
    this.openai = new OpenAI({ apiKey: openaiKey || 'mock-key' });
    this.deepseek = new OpenAI({
      apiKey: deepseekKey || 'mock-key',
      baseURL: 'https://api.deepseek.com',
    });
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
  }

  // Fast reasoning (Groq)
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
        model: 'llama-3.1-8b-instant',
      });
      console.log(`[ModelService] Groq call took ${Date.now() - start}ms`);
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ModelService] Groq API error:', error);
      return `Error in fast reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Deep reasoning (OpenAI)
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
        model: 'gpt-4o-mini',
      });
      console.log(`[ModelService] OpenAI call took ${Date.now() - start}ms`);
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ModelService] OpenAI API error:', error);
      return `Error in deep reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Analytical reasoning (DeepSeek)
  async analyticalReasoning(prompt: string, context?: string): Promise<string> {
    if (this.isDeepSeekMock) {
      return `[Mock DeepSeek] Analytical reasoning for: ${prompt.substring(0, 50)}...`;
    }
    const start = Date.now();
    try {
      const completion = await this.deepseek.chat.completions.create({
        messages: [
          { role: 'system', content: `You are an analytical reasoning engine. Context: ${context || 'None'}` },
          { role: 'user', content: prompt }
        ],
        model: 'deepseek-chat',
      });
      console.log(`[ModelService] DeepSeek call took ${Date.now() - start}ms`);
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ModelService] DeepSeek API error:', error);
      return `Error in analytical reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Creative reasoning (Gemini)
  async creativeReasoning(prompt: string, context?: string): Promise<string> {
    if (this.isGeminiMock || !this.gemini) {
      return `[Mock Gemini] Creative reasoning for: ${prompt.substring(0, 50)}...`;
    }
    const start = Date.now();
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const fullPrompt = context ? `Context: ${context}\n\n${prompt}` : prompt;
      const result = await model.generateContent(fullPrompt);
      console.log(`[ModelService] Gemini call took ${Date.now() - start}ms`);
      return result.response.text();
    } catch (error) {
      console.error('[ModelService] Gemini API error:', error);
      return `Error in creative reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
