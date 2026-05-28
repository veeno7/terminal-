import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import type { ChatMessage, AiName, BrainstormRound } from '../../shared/types/index.js';
import { askOpenAI } from '../providers/openai.js';
import { askGroq } from '../providers/groq.js';
import { askDeepSeek } from '../providers/deepseek.js';
import { askGemini } from '../providers/gemini.js';
import { getSkillList, parseSkillCalls, executeSkill } from '../skills-bridge.js';

// ─── In-memory chat history ───────────────────────────────────
let chatHistory: ChatMessage[] = [];

type AskFn = (system: string, msgs: { role: 'user' | 'assistant'; content: string }[]) => Promise<string>;

const aiCallers: Record<AiName, AskFn> = {
  openai: askOpenAI,
  groq: askGroq,
  deepseek: askDeepSeek,
  gemini: askGemini,
};

const AI_NAMES: AiName[] = ['openai', 'groq', 'deepseek', 'gemini'];

const AI_DISPLAY: Record<AiName, string> = {
  openai: 'OpenAI GPT',
  groq: 'Groq',
  deepseek: 'DeepSeek',
  gemini: 'Gemini',
};

// ─── System prompts ───────────────────────────────────────────
function getBrainstormSystemPrompt(aiName: AiName, round: BrainstormRound): string {
  const name = AI_DISPLAY[aiName];
  const others = AI_NAMES.filter((n) => n !== aiName).map((n) => `@${n}`).join(', ');
  const skillList = getSkillList();

  const base = `You are ${name}, one of four AI assistants brainstorming together as equal peers.
The other AIs are: ${others}. You can tag them with @openai, @groq, @deepseek, @gemini, or @all.
Be collaborative, curious, and direct. Build on good ideas. Question unclear points.
Do NOT repeat what others said — add something new or build on it.

You have access to the following skills that you can invoke to fetch real data, run operations, or produce outputs.
To use a skill, include this exact syntax in your response:
[SKILL:skill-name:{"param1":"value1","param2":"value2"}]

Available skills:
${skillList}

Only invoke a skill if it genuinely helps answer the question. The result will be injected back into the conversation.`;

  if (round === 1) {
    return `${base}

ROUND 1: Give your initial honest answer. You haven't seen the other AIs yet. Be thorough.
If a skill would help you give a better answer, use it.`;
  }
  if (round === 2) {
    return `${base}

ROUND 2: You can now see what the other AIs said. Build on strong points, question weak ones.
Tag a specific AI if you want their input. Add new angles not yet covered.
Invoke a skill if it would help strengthen the group's thinking.`;
  }
  if (round === 3) {
    return `${base}

ROUND 3: The group is converging. Read all previous responses carefully.
Refine your thinking based on what you've learned. Narrow toward the single best answer.
If you agree with another AI's point, say so and expand it.`;
  }
  if (round === 'consensus') {
    return `${base}

CONSENSUS CHECK: Based on everything discussed, does the group have a solid, complete answer?
Reply with exactly: YES or NO on the first line, then one sentence explaining why.`;
  }
  return base;
}

function getFinalDraftPrompt(): string {
  return `You are Groq, writing the final collective output of a 4-AI brainstorm session.
The group (OpenAI GPT, Groq, DeepSeek, Gemini) has discussed and reached consensus.
Write the final clean, complete, well-structured answer — the product of all four AIs.
Make it clear, thorough, and ready to use. If code is needed, include it fully.
If skill results were produced during brainstorming, incorporate their outputs naturally.
Do NOT mention the brainstorm process — just deliver the final answer.`;
}

// ─── Skill execution within AI responses ─────────────────────
interface SkillResult {
  skillName: string;
  params: Record<string, unknown>;
  success: boolean;
  result: string;
}

async function processSkillCalls(content: string): Promise<{ cleanContent: string; skillResults: SkillResult[] }> {
  const calls = parseSkillCalls(content);
  const skillResults: SkillResult[] = [];

  let cleanContent = content;
  for (const call of calls) {
    const outcome = await executeSkill(call.skillName, call.params);
    skillResults.push({ skillName: call.skillName, params: call.params, ...outcome });
    // Replace the raw skill tag with a result placeholder in content
    cleanContent = cleanContent.replace(
      call.raw,
      `[Used skill: ${call.skillName} → ${outcome.success ? 'success' : 'failed'}]`
    );
  }

  return { cleanContent, skillResults };
}

// ─── Build message array for AI ──────────────────────────────
function buildMessages(
  userMessage: string,
  priorRoundMessages?: ChatMessage[]
): { role: 'user' | 'assistant'; content: string }[] {
  const msgs: { role: 'user' | 'assistant'; content: string }[] = [];

  // Include recent final drafts from prior turns for context
  const priorDrafts = chatHistory.filter((m) => m.isFinalDraft).slice(-3);
  for (const d of priorDrafts) {
    msgs.push({ role: 'assistant', content: `[Previous answer]: ${d.content}` });
  }

  if (priorRoundMessages && priorRoundMessages.length > 0) {
    const context = priorRoundMessages
      .map((m) => {
        let label = `[${AI_DISPLAY[m.aiName!]} - Round ${m.round}]`;
        const skillSummary = m.skillResults && m.skillResults.length > 0
          ? `\n  Skills used: ${m.skillResults.map((s: SkillResult) => `${s.skillName} (${s.success ? 'ok' : 'failed'})`).join(', ')}`
          : '';
        return `${label}: ${m.content}${skillSummary}`;
      })
      .join('\n\n');
    msgs.push({
      role: 'user',
      content: `Here is what the other AIs said:\n\n${context}\n\nUser question: ${userMessage}`,
    });
  } else {
    msgs.push({ role: 'user', content: userMessage });
  }

  return msgs;
}

// ─── Call all 4 AIs in parallel ──────────────────────────────
async function callAllAIs(
  round: BrainstormRound,
  userMessage: string,
  priorMessages: ChatMessage[]
): Promise<ChatMessage[]> {
  const results = await Promise.allSettled(
    AI_NAMES.map(async (aiName) => {
      const systemPrompt = getBrainstormSystemPrompt(aiName, round);
      const msgs = buildMessages(userMessage, round === 1 ? undefined : priorMessages);
      const rawContent = await aiCallers[aiName](systemPrompt, msgs);

      // Process any skill calls in the response
      const { cleanContent, skillResults } = await processSkillCalls(rawContent);

      // If there are skill results, append them to content for other AIs to see
      let finalContent = cleanContent;
      if (skillResults.length > 0) {
        const resultText = skillResults
          .map((s) => `\n[Skill result — ${s.skillName}]:\n${s.result}`)
          .join('\n');
        finalContent = `${cleanContent}\n${resultText}`;
      }

      const msg: ChatMessage = {
        id: uuid(),
        role: 'agent',
        content: finalContent,
        timestamp: new Date().toISOString(),
        aiName,
        round,
        skillResults: skillResults.length > 0 ? skillResults : undefined,
      } as ChatMessage & { skillResults?: SkillResult[] };

      return msg;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ChatMessage> => r.status === 'fulfilled')
    .map((r) => r.value);
}

// ─── Consensus check ─────────────────────────────────────────
async function checkConsensus(
  userMessage: string,
  allRoundMessages: ChatMessage[]
): Promise<{ votes: Record<AiName, boolean>; messages: ChatMessage[] }> {
  const votes: Partial<Record<AiName, boolean>> = {};
  const messages: ChatMessage[] = [];

  const context = allRoundMessages
    .map((m) => `[${AI_DISPLAY[m.aiName!]} - Round ${m.round}]: ${m.content}`)
    .join('\n\n');

  const results = await Promise.allSettled(
    AI_NAMES.map(async (aiName) => {
      const systemPrompt = getBrainstormSystemPrompt(aiName, 'consensus');
      const msgs: { role: 'user' | 'assistant'; content: string }[] = [
        {
          role: 'user',
          content: `Original question: ${userMessage}\n\nAll brainstorm responses:\n\n${context}\n\nDo you agree the group has a complete answer?`,
        },
      ];
      const content = await aiCallers[aiName](systemPrompt, msgs);
      const agreed = content.trim().toUpperCase().startsWith('YES');
      const msg: ChatMessage = {
        id: uuid(),
        role: 'agent',
        content,
        timestamp: new Date().toISOString(),
        aiName,
        round: 'consensus',
        vote: agreed,
      };
      return { aiName, agreed, msg };
    })
  );

  for (const r of results) {
    if (r.status === 'fulfilled') {
      votes[r.value.aiName] = r.value.agreed;
      messages.push(r.value.msg);
    }
  }

  return { votes: votes as Record<AiName, boolean>, messages };
}

// ─── Final draft by Groq ──────────────────────────────────────
async function writeFinalDraft(userMessage: string, allMessages: ChatMessage[]): Promise<ChatMessage> {
  const context = allMessages
    .filter((m) => m.round !== 'consensus')
    .map((m) => `[${AI_DISPLAY[m.aiName!]} - Round ${m.round}]: ${m.content}`)
    .join('\n\n');

  const msgs: { role: 'user' | 'assistant'; content: string }[] = [
    {
      role: 'user',
      content: `Original question: ${userMessage}\n\nFull brainstorm:\n\n${context}\n\nWrite the final collective answer.`,
    },
  ];

  const content = await askGroq(getFinalDraftPrompt(), msgs);

  return {
    id: uuid(),
    role: 'agent',
    content,
    timestamp: new Date().toISOString(),
    aiName: 'groq',
    round: 'draft',
    isFinalDraft: true,
  };
}

// ─── Exported handlers ────────────────────────────────────────
export function getChatHistory(_req: Request, res: Response) {
  res.json(chatHistory);
}

export async function sendMessage(req: Request, res: Response) {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const userMsg: ChatMessage = {
    id: uuid(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };
  chatHistory.push(userMsg);

  try {
    const allBrainstormMessages: ChatMessage[] = [];

    const round1 = await callAllAIs(1, message, []);
    allBrainstormMessages.push(...round1);

    const round2 = await callAllAIs(2, message, round1);
    allBrainstormMessages.push(...round2);

    const round3 = await callAllAIs(3, message, [...round1, ...round2]);
    allBrainstormMessages.push(...round3);

    const { votes, messages: consensusMsgs } = await checkConsensus(message, allBrainstormMessages);
    allBrainstormMessages.push(...consensusMsgs);

    const consensusReached = Object.values(votes).every(Boolean);

    if (!consensusReached) {
      const bonusRound = await callAllAIs(3, message, allBrainstormMessages.filter((m) => m.round !== 'consensus'));
      allBrainstormMessages.push(...bonusRound);
    }

    const finalDraft = await writeFinalDraft(message, allBrainstormMessages);
    chatHistory.push(finalDraft);

    res.json({
      userMessage: userMsg,
      messages: allBrainstormMessages,
      finalDraft,
      consensusReached,
    });
  } catch (err) {
    console.error('[chat.controller] Brainstorm error:', err);
    res.status(500).json({ error: 'Brainstorm session failed. Check your API keys.' });
  }
}
