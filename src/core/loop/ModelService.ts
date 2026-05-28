import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class ModelService {
  private groq: Groq;
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI | null = null;
  private isGroqMock: boolean = false;
  private isOpenAIMock: boolean = false;
  private isGeminiMock: boolean = false;

  constructor() {
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey) {
      console.warn('[ModelService] GROQ_API_KEY missing. Using mock mode for fast reasoning.');
      this.isGroqMock = true;
    }
    if (!openaiKey) {
      console.warn('[ModelService] OPENAI_API_KEY missing. Using mock mode for deep reasoning.');
      this.isOpenAIMock = true;
    }
    if (!geminiKey) {
      console.warn('[ModelService] GEMINI_API_KEY missing. Using mock mode for Gemini.');
      this.isGeminiMock = true;
    }

    this.groq = new Groq({ apiKey: groqKey || 'mock-key' });
    this.openai = new OpenAI({ apiKey: openaiKey || 'mock-key' });
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
  }

  // Fast reasoning (Groq - fast responses)
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
        model: 'gpt-5',
      });
      const duration = Date.now() - start;
      console.log(`[ModelService] OpenAI call took ${duration}ms`);
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ModelService] OpenAI API error:', error);
      return `Error in deep reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Creative reasoning (Gemini - free tier)
  async creativeReasoning(prompt: string, context?: string): Promise<string> {
    if (this.isGeminiMock || !this.gemini) {
      return `[Mock Gemini] Creative reasoning for: ${prompt.substring(0, 50)}...`;
    }

    const start = Date.now();
    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const fullPrompt = context
        ? `Context: ${context}\n\n${prompt}`
        : prompt;
      const result = await model.generateContent(fullPrompt);
      const duration = Date.now() - start;
      console.log(`[ModelService] Gemini call took ${duration}ms`);
      return result.response.text();
    } catch (error) {
      console.error('[ModelService] Gemini API error:', error);
      return `Error in creative reasoning: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
