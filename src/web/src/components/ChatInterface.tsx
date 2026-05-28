import { useState, useRef, useEffect } from 'react';

type AiName = 'groq' | 'openai' | 'deepseek' | 'gemini';

interface SkillResult {
  skillName: string;
  params: Record<string, unknown>;
  result: string;
  success: boolean;
}

interface AiMessage {
  id: string;
  ai: AiName;
  round: number;
  content: string;
  skillResults: SkillResult[];
  thinking: boolean;
}

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  messages?: AiMessage[];
  consensus?: boolean;
  finalDraft?: string;
  codeOutput?: string;
  currentRound?: number;
  done?: boolean;
}

const AI_COLORS: Record<AiName, string> = {
  groq:     'bg-purple-600',
  openai:   'bg-green-600',
  deepseek: 'bg-blue-600',
  gemini:   'bg-orange-500',
};

const AI_LABELS: Record<AiName, string> = {
  groq:     'Groq',
  openai:   'OpenAI',
  deepseek: 'DeepSeek',
  gemini:   'Gemini',
};

function AiAvatar({ ai }: { ai: AiName }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AI_COLORS[ai]}`}>
      {AI_LABELS[ai][0]}
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 items-center ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function SkillBadge({ result }: { result: SkillResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className={`text-xs px-2 py-0.5 rounded-full font-mono border ${result.success ? 'bg-green-900 border-green-600 text-green-300' : 'bg-red-900 border-red-600 text-red-300'}`}
      >
        {result.success ? '⚡' : '✗'} {result.skillName} {open ? '▲' : '▼'}
      </button>
      {open && (
        <pre className="mt-1 text-xs bg-gray-900 border border-gray-700 rounded p-2 whitespace-pre-wrap text-gray-300 max-h-40 overflow-y-auto">
          {result.result}
        </pre>
      )}
    </div>
  );
}

function AiMessageBubble({ msg }: { msg: AiMessage }) {
  return (
    <div className="flex gap-3 items-start mb-3 animate-fade-in">
      <AiAvatar ai={msg.ai} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-300">{AI_LABELS[msg.ai]}</span>
          <span className="text-xs text-gray-500">Round {msg.round}</span>
        </div>
        {msg.thinking ? (
          <div className="text-sm text-gray-400 italic">
            thinking<ThinkingDots />
          </div>
        ) : (
          <div className="text-sm text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
            {msg.content}
          </div>
        )}
        {msg.skillResults.map((sr, i) => (
          <SkillBadge key={i} result={sr} />
        ))}
      </div>
    </div>
  );
}

function RoundDivider({ round, active }: { round: number; active: boolean }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-700" />
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${active ? 'border-blue-500 text-blue-400 bg-blue-950' : 'border-gray-600 text-gray-500 bg-gray-900'}`}>
        {active ? '● ' : ''}Round {round}
        {round === 1 && ' — Independent'}
        {round === 2 && ' — Build & Challenge'}
        {round === 3 && ' — Converge'}
      </span>
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );
}

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    const userEntry: ChatEntry = { role: 'user', content: userMessage };
    const assistantEntry: ChatEntry = {
      role: 'assistant',
      content: '',
      messages: [],
      currentRound: 1,
      done: false,
    };

    setHistory((prev) => [...prev, userEntry, assistantEntry]);

    const historyForApi = history.map((h) => ({ role: h.role, content: h.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: historyForApi }),
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      function updateAssistant(updater: (entry: ChatEntry) => ChatEntry) {
        setHistory((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last.role === 'assistant') next[next.length - 1] = updater(last);
          return next;
        });
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (eventType === 'round_start') {
              updateAssistant((e) => ({ ...e, currentRound: data.round }));
            }

            if (eventType === 'ai_thinking') {
              const thinkingMsg: AiMessage = {
                id: `${data.ai}-${data.round}-thinking`,
                ai: data.ai as AiName,
                round: data.round,
                content: '',
                skillResults: [],
                thinking: true,
              };
              updateAssistant((e) => ({
                ...e,
                messages: [...(e.messages ?? []).filter((m) => m.id !== thinkingMsg.id), thinkingMsg],
              }));
            }

            if (eventType === 'ai_message') {
              const newMsg: AiMessage = {
                id: `${data.ai}-${data.round}`,
                ai: data.ai as AiName,
                round: data.round,
                content: data.content,
                skillResults: data.skillResults ?? [],
                thinking: false,
              };
              updateAssistant((e) => ({
                ...e,
                messages: [
                  ...(e.messages ?? []).filter((m) => m.id !== `${data.ai}-${data.round}-thinking` && m.id !== newMsg.id),
                  newMsg,
                ],
              }));
            }

            if (eventType === 'consensus_result') {
              updateAssistant((e) => ({ ...e, consensus: data.consensus }));
            }

            if (eventType === 'final_draft') {
              updateAssistant((e) => ({
                ...e,
                finalDraft: data.content,
                codeOutput: data.codeOutput,
                done: true,
              }));
            }
          }
        }
      }
    } catch (err) {
      updateAssistantError(String(err));
    } finally {
      setLoading(false);
    }

    function updateAssistantError(msg: string) {
      setHistory((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === 'assistant') {
          next[next.length - 1] = { ...last, finalDraft: `Error: ${msg}`, done: true };
        }
        return next;
      });
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex gap-1">
          {(['groq','openai','deepseek','gemini'] as AiName[]).map((ai) => (
            <div key={ai} className={`w-3 h-3 rounded-full ${AI_COLORS[ai]}`} title={AI_LABELS[ai]} />
          ))}
        </div>
        <h1 className="font-bold text-sm text-gray-100">Multi-AI Brainstorm</h1>
        <span className="text-xs text-gray-500 ml-auto">Groq · OpenAI · DeepSeek · Gemini</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {history.map((entry, idx) => (
          <div key={idx}>
            {entry.role === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xl text-sm">
                  {entry.content}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {/* AI round messages streamed live */}
                {[1, 2, 3].map((round) => {
                  const roundMsgs = (entry.messages ?? []).filter((m) => m.round === round);
                  if (roundMsgs.length === 0 && (entry.currentRound ?? 0) < round) return null;
                  return (
                    <div key={round}>
                      <RoundDivider round={round} active={entry.currentRound === round && !entry.done} />
                      {roundMsgs.map((msg) => (
                        <AiMessageBubble key={msg.id} msg={msg} />
                      ))}
                      {entry.currentRound === round && !entry.done && roundMsgs.filter(m => !m.thinking).length === 0 && (
                        <div className="text-xs text-gray-500 italic text-center py-2">AIs are thinking...</div>
                      )}
                    </div>
                  );
                })}

                {/* Consensus */}
                {entry.consensus !== undefined && (
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg mt-3 ${entry.consensus ? 'bg-green-950 border border-green-700 text-green-300' : 'bg-yellow-950 border border-yellow-700 text-yellow-300'}`}>
                    {entry.consensus ? '✓ Consensus reached' : '⚠ Partial agreement — Groq will synthesize'}
                  </div>
                )}

                {/* Final draft */}
                {entry.finalDraft && (
                  <div className="mt-4 rounded-xl border border-purple-700 bg-purple-950 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">G</div>
                      <span className="text-xs font-semibold text-purple-300">Groq — Final Draft</span>
                    </div>
                    <div className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
                      {entry.finalDraft}
                    </div>
                    {entry.codeOutput && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 font-semibold mb-1">▶ Execution Output</div>
                        <pre className="text-xs bg-gray-900 border border-gray-700 rounded p-3 text-green-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {entry.codeOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything — all 4 AIs will brainstorm together..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            style={{ maxHeight: '140px', overflowY: 'auto' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
