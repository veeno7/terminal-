import { Request, Response } from 'express';
import { askGroq } from '../providers/groq.js';
import { askOpenAI } from '../providers/openai.js';
import { askDeepSeek } from '../providers/deepseek.js';
import { askGemini } from '../providers/gemini.js';
import { SkillRegistry } from '../../core/executor/SkillRegistry.js';
import { SkillExecutor } from '../../core/executor/SkillExecutor.js';
import { MemoryManager } from '../../core/memory/MemoryManager.js';

export type AiName = 'groq' | 'openai' | 'deepseek' | 'gemini';

interface SkillCallResult {
  skillName: string;
  params: Record<string, unknown>;
  result: string;
  success: boolean;
}

// ─── Rate-limit tracker ───────────────────────────────────────────────────────
// Tracks when a rate-limited AI can be retried (Unix ms timestamp)
const rateLimitedUntil: Record<AiName, number> = {
  groq: 0,
  openai: 0,
  deepseek: 0,
  gemini: 0,
};

// How long to silence an AI after a 429 (default: 60 seconds)
const RATE_LIMIT_COOLDOWN_MS = 60_000;

function isRateLimited(ai: AiName): boolean {
  return Date.now() < rateLimitedUntil[ai];
}

function markRateLimited(ai: AiName) {
  rateLimitedUntil[ai] = Date.now() + RATE_LIMIT_COOLDOWN_MS;
  console.warn(`[RateLimit] ${ai} is rate-limited. Silenced for ${RATE_LIMIT_COOLDOWN_MS / 1000}s.`);
}

function isRateLimitError(err: unknown): boolean {
  if (!err) return false;
  const msg = String(err instanceof Error ? err.message : err).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('quota') ||
    msg.includes('too many requests')
  );
}

// ─── Singleton registry + executor ───────────────────────────────────────────
const registry = new SkillRegistry();
const memoryManager = new MemoryManager();
const executor = new SkillExecutor(registry, memoryManager);
let registryReady = false;

async function ensureRegistry() {
  if (!registryReady) {
    await registry.initialize();
    registryReady = true;
  }
}

// ─── SSE helper ──────────────────────────────────────────────────────────────
function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── Skill tag parsing ────────────────────────────────────────────────────────
function parseSkillCalls(text: string) {
  const calls: Array<{ tag: string; name: string; params: Record<string, unknown> }> = [];
  const regex = /\[SKILL:([a-zA-Z0-9_-]+):(\{.*?\})\]/gs;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      calls.push({ tag: match[0], name: match[1], params: JSON.parse(match[2]) as Record<string, unknown> });
    } catch { /* skip malformed */ }
  }
  return calls;
}

// ─── Skill resolution — NOW ACTUALLY EXECUTES skills ─────────────────────────
async function resolveSkillCalls(text: string): Promise<{ resolvedText: string; skillResults: SkillCallResult[] }> {
  const calls = parseSkillCalls(text);
  let resolvedText = text;
  const skillResults: SkillCallResult[] = [];

  for (const call of calls) {
    const skill = registry.getSkill(call.name);
    if (skill) {
      try {
        // Actually execute the skill via SkillExecutor
        const observation = await executor.execute(call.name, call.params);
        const resultText = observation.status === 'success'
          ? JSON.stringify(observation.data ?? '(no output)')
          : `Skill error: ${observation.error ?? 'unknown'}`;

        skillResults.push({ skillName: call.name, params: call.params, result: resultText, success: observation.status === 'success' });
        resolvedText = resolvedText.replace(call.tag, `[SKILL_RESULT:${call.name}] ${resultText} [/SKILL_RESULT]`);
      } catch (err) {
        const resultText = `Skill execution failed: ${String(err instanceof Error ? err.message : err)}`;
        skillResults.push({ skillName: call.name, params: call.params, result: resultText, success: false });
        resolvedText = resolvedText.replace(call.tag, `[SKILL_RESULT:${call.name}] ${resultText} [/SKILL_RESULT]`);
      }
    } else {
      const resultText = `Skill "${call.name}" not found.`;
      skillResults.push({ skillName: call.name, params: call.params, result: resultText, success: false });
      resolvedText = resolvedText.replace(call.tag, `[SKILL_RESULT:${call.name}] ${resultText} [/SKILL_RESULT]`);
    }
  }

  return { resolvedText, skillResults };
}

// ─── System prompt builder ────────────────────────────────────────────────────
function buildSystemPrompt(aiName: AiName, round: number): string {
  const allSkills = registry.getAllSkills();
  const skillLines = allSkills
    .map((s) => `- ${s.name}: ${(s as { name: string; description?: string }).description ?? ''}`)
    .join('\n');
  const roundDesc =
    round === 1
      ? 'Round 1: Give your independent, honest answer. Think freely.'
      : round === 2
      ? 'Round 2: You can see what the other AIs said. Build on their ideas, challenge weak points, add depth.'
      : 'Round 3: Converge. What is the single best answer everyone can agree on?';

  return `You are ${aiName.toUpperCase()}, one of four AI peers in a live collaborative brainstorm.
The other AIs are: ${(['groq', 'openai', 'deepseek', 'gemini'] as AiName[]).filter((a) => a !== aiName).join(', ')}.

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

// ─── AI caller with rate-limit awareness ─────────────────────────────────────
async function callAi(aiName: AiName, systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  switch (aiName) {
    case 'groq': return askGroq(systemPrompt, messages);
    case 'openai': return askOpenAI(systemPrompt, messages);
    case 'deepseek': return askDeepSeek(systemPrompt, messages);
    case 'gemini': return askGemini(systemPrompt, messages);
  }
}

// ─── Code execution ───────────────────────────────────────────────────────────
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

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function handleChat(req: Request, res: Response): Promise<void> {
  const { message, history = [] } = req.body as {
    message: string;
    history: Array<{ role: string; content: string }>;
  };

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  await ensureRegistry();

  const allAiNames: AiName[] = ['groq', 'openai', 'deepseek', 'gemini'];
  const allRoundContents: string[][] = [];

  // Build base message history
  const baseHistory: ChatMessage[] = history
    .filter((h) => h.role === 'user' || h.role === 'assistant')
    .map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content }));
  const baseMessages: ChatMessage[] = [...baseHistory, { role: 'user', content: message }];

  // ─── Rounds 1–3 ────────────────────────────────────────────────────────────
  let currentMessages: ChatMessage[] = [...baseMessages];

  for (let roundNum = 1; roundNum <= 3; roundNum++) {
    sendEvent(res, 'round_start', { round: roundNum });

    // Determine which AIs are active this round (skip rate-limited ones)
    const activeAis = allAiNames.filter((ai) => !isRateLimited(ai));
    const skippedAis = allAiNames.filter((ai) => isRateLimited(ai));

    // Notify frontend which AIs are sitting out
    for (const ai of skippedAis) {
      sendEvent(res, 'ai_rate_limited', {
        ai,
        round: roundNum,
        retryAt: rateLimitedUntil[ai],
        message: `${ai.toUpperCase()} is rate-limited and will resume when its free tier resets.`,
      });
    }

    const roundPromises = activeAis.map(async (ai, idx) => {
      await new Promise((r) => setTimeout(r, idx * 120));
      sendEvent(res, 'ai_thinking', { ai, round: roundNum });

      try {
        const systemPrompt = buildSystemPrompt(ai, roundNum);
        const raw = await callAi(ai, systemPrompt, currentMessages);
        const { resolvedText, skillResults } = await resolveSkillCalls(raw);

        sendEvent(res, 'ai_message', { ai, round: roundNum, content: resolvedText, skillResults });
        return { ai, content: resolvedText };
      } catch (err) {
        // Check if it's a rate-limit error — if so, silence the AI
        if (isRateLimitError(err)) {
          markRateLimited(ai);
          sendEvent(res, 'ai_rate_limited', {
            ai,
            round: roundNum,
            retryAt: rateLimitedUntil[ai],
            message: `${ai.toUpperCase()} hit its rate limit and has been silenced until its free tier resets.`,
          });
          return { ai, content: '' };
        }

        const errorMsg = `[Error: ${String(err instanceof Error ? err.message : err)}]`;
        console.error(`[chat.controller] ${ai} failed in round ${roundNum}:`, err);
        sendEvent(res, 'ai_message', { ai, round: roundNum, content: errorMsg, skillResults: [] });
        return { ai, content: errorMsg };
      }
    });

    const results = await Promise.all(roundPromises);

    // Include skipped AIs as empty entries so index alignment is preserved
    const fullResults = allAiNames.map((ai) => {
      const found = results.find((r) => r.ai === ai);
      return found ?? { ai, content: '' };
    });

    const roundSummary = fullResults
      .filter((r) => r.content)
      .map((r) => `[${r.ai.toUpperCase()}]: ${r.content}`)
      .join('\n\n');

    allRoundContents.push(fullResults.map((r) => r.content));

    // Append round summary to message history
    currentMessages = [
      ...currentMessages,
      { role: 'assistant', content: `[Round ${roundNum} responses]\n${roundSummary}` },
      ...(roundNum < 3
        ? [{
            role: 'user' as const,
            content:
              roundNum === 1
                ? 'Round 2: You can now see what the others said. Build on it, challenge it, deepen it.'
                : 'Round 3: Converge. Agree on the single best answer.',
          }]
        : []),
    ];

    sendEvent(res, 'round_end', { round: roundNum });
  }

  // ─── Consensus check ───────────────────────────────────────────────────────
  sendEvent(res, 'consensus_checking', {});
  const round3Summary = allRoundContents[2].filter(Boolean).join('\n\n');

  // Use OpenAI for consensus if Groq is rate-limited, else use Groq
  const consensusAi: AiName = isRateLimited('groq') ? 'openai' : 'groq';
  let consensus = false;
  try {
    const consensusRaw = await callAi(
      consensusAi,
      'You are an impartial evaluator. Given the AI responses, did they reach consensus? Reply only "true" or "false".',
      [{ role: 'user', content: round3Summary }]
    );
    consensus = consensusRaw.trim().toLowerCase().startsWith('true');
  } catch (err) {
    if (isRateLimitError(err)) markRateLimited(consensusAi);
    console.error('[chat.controller] Consensus check failed:', err);
  }
  sendEvent(res, 'consensus_result', { consensus });

  // ─── Final draft ───────────────────────────────────────────────────────────
  // Use OpenAI if Groq is rate-limited, otherwise use Groq
  const finalDraftAi: AiName = isRateLimited('groq') ? 'openai' : 'groq';

  sendEvent(res, 'final_draft_start', { synthesizer: finalDraftAi });

  const allContext = allRoundContents
    .map((round, i) =>
      `=== Round ${i + 1} ===\n${round
        .map((c, j) => (c ? `[${allAiNames[j].toUpperCase()}]: ${c}` : ''))
        .filter(Boolean)
        .join('\n\n')}`
    )
    .join('\n\n');

  let finalDraft = 'Unable to generate final draft.';
  try {
    finalDraft = await callAi(
      finalDraftAi,
      `You are ${finalDraftAi.toUpperCase()}, the final synthesizer. Write the single best, complete answer based on all brainstorming rounds. If code is needed, include a fenced code block. Be thorough.`,
      [{ role: 'user', content: `Original question: ${message}\n\n${allContext}` }]
    );
  } catch (err) {
    if (isRateLimitError(err)) markRateLimited(finalDraftAi);
    console.error('[chat.controller] Final draft failed:', err);
    finalDraft = `[Final draft error: ${String(err instanceof Error ? err.message : err)}]`;
  }

  let codeOutput: string | undefined;
  if (containsCode(finalDraft)) {
    sendEvent(res, 'executing_code', {});
    codeOutput = await executeCode(finalDraft);
  }

  sendEvent(res, 'final_draft', { content: finalDraft, synthesizer: finalDraftAi, codeOutput });
  sendEvent(res, 'done', {});
  res.end();
}
