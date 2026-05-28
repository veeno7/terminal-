import { Request, Response } from 'express';
import { askGroq } from '../providers/groq.js';
import { askOpenAI } from '../providers/openai.js';
import { askDeepSeek } from '../providers/deepseek.js';
import { askGemini } from '../providers/gemini.js';
import { SkillRegistry } from '../../core/executor/SkillRegistry.js';

export type AiName = 'groq' | 'openai' | 'deepseek' | 'gemini';

interface SkillCallResult {
  skillName: string;
  params: Record<string, unknown>;
  result: string;
  success: boolean;
}

// Singleton skill registry — initialized once on first request
const registry = new SkillRegistry();
let registryReady = false;

async function ensureRegistry() {
  if (!registryReady) {
    await registry.initialize();
    registryReady = true;
  }
}

// SSE helper — writes a typed event to the response stream
function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function parseSkillCalls(text: string) {
  const calls: Array<{ tag: string; name: string; params: Record<string, unknown> }> = [];
  const regex = /\[SKILL:([a-zA-Z0-9_-]+):(\{.*?\})\]/gs;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      calls.push({ tag: match[0], name: match[1], params: JSON.parse(match[2]) });
    } catch { /* skip malformed */ }
  }
  return calls;
}

async function resolveSkillCalls(text: string): Promise<{ resolvedText: string; skillResults: SkillCallResult[] }> {
  const calls = parseSkillCalls(text);
  let resolvedText = text;
  const skillResults: SkillCallResult[] = [];
  for (const call of calls) {
    const skill = registry.getSkill(call.name);
    if (skill) {
      const resultText = `[Skill ${call.name} registered at ${skill.path ?? 'unknown'}]`;
      skillResults.push({ skillName: call.name, params: call.params, result: resultText, success: true });
      resolvedText = resolvedText.replace(call.tag, `[SKILL_RESULT:${call.name}] ${resultText} [/SKILL_RESULT]`);
    } else {
      const resultText = `Skill "${call.name}" not found.`;
      skillResults.push({ skillName: call.name, params: call.params, result: resultText, success: false });
      resolvedText = resolvedText.replace(call.tag, `[SKILL_RESULT:${call.name}] ${resultText} [/SKILL_RESULT]`);
    }
  }
  return { resolvedText, skillResults };
}

function buildSystemPrompt(aiName: AiName, round: number): string {
  const allSkills = registry.getAllSkills();
  const skillLines = allSkills.map((s) => `- ${s.name}: ${(s as { name: string; description?: string }).description ?? ''}`).join('\n');
  const roundDesc =
    round === 1 ? 'Round 1: Give your independent, honest answer. Think freely.'
    : round === 2 ? 'Round 2: You can see what the other AIs said. Build on their ideas, challenge weak points, add depth.'
    : 'Round 3: Converge. What is the single best answer everyone can agree on?';

  return `You are ${aiName.toUpperCase()}, one of four AI peers in a live collaborative brainstorm.
The other AIs are: ${(['groq','openai','deepseek','gemini'] as AiName[]).filter(a => a !== aiName).join(', ')}.

${roundDesc}

You may invoke real skills using: [SKILL:skill_name:{"param":"value"}]
Available skills:
${skillLines || '(none loaded)'}

Rules:
- Tag a peer with @groq, @openai, @deepseek, @gemini to speak to them directly.
- Use @all to address everyone.
- Use [SKILL:...] when a tool would improve your answer.
- Be collaborative. React to what others said. Show your reasoning.
- Keep responses focused — max 3-4 paragraphs.`;
}

type ChatMessage = { role: 'user' | 'assistant'; content: string };

async function callAi(
  aiName: AiName,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  switch (aiName) {
    case 'groq':     return askGroq(systemPrompt, messages);
    case 'openai':   return askOpenAI(systemPrompt, messages);
    case 'deepseek': return askDeepSeek(systemPrompt, messages);
    case 'gemini':   return askGemini(systemPrompt, messages);
  }
}

function containsCode(text: string): boolean {
  return /```[\s\S]*?```/.test(text);
}

async function executeCode(text: string): Promise<string> {
  const match = /```(?:javascript|typescript|js|ts)?\n([\s\S]*?)```/.exec(text);
  if (!match) return '';
  try {
    const fn = new Function(`
      const logs = [];
      const console = { log: (...a) => logs.push(a.join(' ')), error: (...a) => logs.push('[ERR] '+a.join(' ')), warn: (...a) => logs.push('[WARN] '+a.join(' ')) };
      try { ${match[1].trim()} } catch(e) { logs.push('[RUNTIME ERROR] '+e.message); }
      return logs.join('\\n');
    `);
    return (fn() as string) || '(no output)';
  } catch (err) {
    return `[Execution Error] ${String(err)}`;
  }
}

export async function handleChat(req: Request, res: Response): Promise<void> {
  const { message, history = [] } = req.body as {
    message: string;
    history: Array<{ role: string; content: string }>;
  };

  if (!message) { res.status(400).json({ error: 'message is required' }); return; }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  await ensureRegistry();

  const aiNames: AiName[] = ['groq', 'openai', 'deepseek', 'gemini'];
  const allRoundContents: string[][] = [];

  // Build base message history (user/assistant only — strip any other roles)
  const baseHistory: ChatMessage[] = history
    .filter((h) => h.role === 'user' || h.role === 'assistant')
    .map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content }));
  const baseMessages: ChatMessage[] = [...baseHistory, { role: 'user', content: message }];

  // ─── Rounds 1–3 ──────────────────────────────────────────────────────────
  let currentMessages: ChatMessage[] = [...baseMessages];

  for (let roundNum = 1; roundNum <= 3; roundNum++) {
    sendEvent(res, 'round_start', { round: roundNum });

    const roundPromises = aiNames.map(async (ai, idx) => {
      await new Promise((r) => setTimeout(r, idx * 120));

      sendEvent(res, 'ai_thinking', { ai, round: roundNum });

      const systemPrompt = buildSystemPrompt(ai, roundNum);
      const raw = await callAi(ai, systemPrompt, currentMessages);
      const { resolvedText, skillResults } = await resolveSkillCalls(raw);

      sendEvent(res, 'ai_message', { ai, round: roundNum, content: resolvedText, skillResults });

      return { ai, content: resolvedText };
    });

    const results = await Promise.all(roundPromises);
    const roundSummary = results.map((r) => `[${r.ai.toUpperCase()}]: ${r.content}`).join('\n\n');
    allRoundContents.push(results.map((r) => r.content));

    // Append round summary and next-round prompt to message history
    currentMessages = [
      ...currentMessages,
      { role: 'assistant', content: `[Round ${roundNum} responses]\n${roundSummary}` },
      ...(roundNum < 3 ? [{
        role: 'user' as const,
        content: roundNum === 1
          ? 'Round 2: You can now see what the others said. Build on it, challenge it, deepen it.'
          : 'Round 3: Converge. Agree on the single best answer.',
      }] : []),
    ];

    sendEvent(res, 'round_end', { round: roundNum });
  }

  // ─── Consensus check ─────────────────────────────────────────────────────
  sendEvent(res, 'consensus_checking', {});
  const round3Summary = allRoundContents[2].join('\n\n');
  const consensusRaw = await askGroq(
    'You are an impartial evaluator. Given four AI responses, did they reach consensus? Reply only "true" or "false".',
    [{ role: 'user', content: round3Summary }]
  );
  const consensus = consensusRaw.trim().toLowerCase().startsWith('true');
  sendEvent(res, 'consensus_result', { consensus });

  // ─── Final draft by Groq ─────────────────────────────────────────────────
  sendEvent(res, 'final_draft_start', {});
  const allContext = allRoundContents
    .map((round, i) => `=== Round ${i + 1} ===\n${round.map((c, j) => `[${aiNames[j].toUpperCase()}]: ${c}`).join('\n\n')}`)
    .join('\n\n');

  const finalDraft = await askGroq(
    'You are Groq, the final synthesizer. Write the single best, complete answer based on all brainstorming rounds. If code is needed, include a fenced code block. Be thorough.',
    [{ role: 'user', content: `Original question: ${message}\n\n${allContext}` }]
  );

  let codeOutput: string | undefined;
  if (containsCode(finalDraft)) {
    sendEvent(res, 'executing_code', {});
    codeOutput = await executeCode(finalDraft);
  }

  sendEvent(res, 'final_draft', { content: finalDraft, codeOutput });
  sendEvent(res, 'done', {});
  res.end();
}
