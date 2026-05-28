import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Send, User, Brain, CheckCircle, XCircle, FileText } from 'lucide-react';
import type { ChatMessage, AiName, BrainstormRound, BrainstormResponse } from '../types';

// ─── AI config ────────────────────────────────────────────────
const AI_CONFIG: Record<AiName, { label: string; color: string; bg: string; border: string }> = {
  openai:   { label: 'OpenAI GPT', color: 'text-emerald-400',  bg: 'bg-emerald-400/10',  border: 'border-emerald-400/30' },
  groq:     { label: 'Groq',       color: 'text-orange-400',   bg: 'bg-orange-400/10',   border: 'border-orange-400/30'  },
  deepseek: { label: 'DeepSeek',   color: 'text-blue-400',     bg: 'bg-blue-400/10',     border: 'border-blue-400/30'    },
  gemini:   { label: 'Gemini',     color: 'text-purple-400',   bg: 'bg-purple-400/10',   border: 'border-purple-400/30'  },
};

const ROUND_LABELS: Record<string, string> = {
  '1': 'Round 1 — First Thoughts',
  '2': 'Round 2 — Building Together',
  '3': 'Round 3 — Converging',
  'consensus': 'Consensus Check',
  'draft': 'Final Draft',
};

// ─── Highlight @mentions ──────────────────────────────────────
function renderContent(content: string) {
  const parts = content.split(/(@(?:openai|groq|deepseek|gemini|all)\b)/gi);
  return parts.map((part, i) => {
    if (part.match(/^@(?:openai|groq|deepseek|gemini|all)$/i)) {
      const key = part.slice(1).toLowerCase() as AiName | 'all';
      const cfg = key !== 'all' ? AI_CONFIG[key as AiName] : null;
      return (
        <span key={i} className={`font-semibold px-1 rounded ${cfg ? cfg.color : 'text-yellow-400'}`}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Single AI message card ───────────────────────────────────
function AiMessageCard({ msg }: { msg: ChatMessage }) {
  const ai = msg.aiName ? AI_CONFIG[msg.aiName] : null;
  if (!ai) return null;
  return (
    <div className={`rounded-xl p-4 border ${ai.bg} ${ai.border}`}>
      <div className={`text-xs font-semibold mb-2 ${ai.color}`}>{ai.label}</div>
      <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
        {renderContent(msg.content)}
      </div>
    </div>
  );
}

// ─── Round section ────────────────────────────────────────────
function RoundSection({ round, messages }: { round: BrainstormRound; messages: ChatMessage[] }) {
  const label = ROUND_LABELS[String(round)] ?? `Round ${round}`;
  const isConsensus = round === 'consensus';

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-gray-700" />
        <span className="text-xs text-gray-500 font-medium px-2">{label}</span>
        <div className="h-px flex-1 bg-gray-700" />
      </div>
      {isConsensus ? (
        <div className="grid grid-cols-2 gap-2">
          {messages.map((msg) => {
            const ai = msg.aiName ? AI_CONFIG[msg.aiName] : null;
            if (!ai) return null;
            return (
              <div key={msg.id} className={`rounded-lg p-3 border ${ai.bg} ${ai.border} flex items-start gap-2`}>
                <div className="mt-0.5 flex-shrink-0">
                  {msg.vote ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div>
                  <div className={`text-xs font-semibold mb-1 ${ai.color}`}>{ai.label}</div>
                  <div className="text-xs text-gray-300 leading-relaxed">{msg.content}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {messages.map((msg) => (
            <AiMessageCard key={msg.id} msg={msg} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Brainstorm session block ─────────────────────────────────
function BrainstormBlock({ sessionMessages, finalDraft, consensusReached }: {
  sessionMessages: ChatMessage[];
  finalDraft: ChatMessage;
  consensusReached: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const rounds = [1, 2, 3, 'consensus'] as const;
  const roundMap = rounds.reduce<Record<string, ChatMessage[]>>((acc, r) => {
    acc[String(r)] = sessionMessages.filter((m) => String(m.round) === String(r));
    return acc;
  }, {});

  return (
    <div className="mt-3 space-y-3">
      {/* Toggle brainstorm */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer"
      >
        {expanded ? '▾' : '▸'} {expanded ? 'Hide' : 'Show'} brainstorm ({sessionMessages.length} messages)
      </button>

      {expanded && (
        <div className="border border-gray-800 rounded-xl p-4 space-y-2 bg-gray-900/50">
          {rounds.map((r) =>
            roundMap[String(r)]?.length > 0 ? (
              <RoundSection key={String(r)} round={r} messages={roundMap[String(r)]} />
            ) : null
          )}
        </div>
      )}

      {/* Consensus status */}
      <div className={`flex items-center gap-2 text-xs ${consensusReached ? 'text-emerald-400' : 'text-yellow-400'}`}>
        {consensusReached ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        {consensusReached ? 'All 4 AIs reached consensus' : 'Partial consensus — draft based on majority'}
      </div>

      {/* Final draft */}
      <div className="rounded-xl border border-orange-400/30 bg-orange-400/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-400">Final Draft — by Groq</span>
          <span className="text-xs text-gray-500">(collective output of all 4 AIs)</span>
        </div>
        <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
          {finalDraft.content}
        </div>
      </div>
    </div>
  );
}

// ─── API call ─────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://cortexforge-core.onrender.com';

async function sendMessageToApi(message: string): Promise<BrainstormResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<BrainstormResponse>;
}

// ─── Main component ───────────────────────────────────────────
interface SessionData {
  userMsgId: string;
  messages: ChatMessage[];
  finalDraft: ChatMessage;
  consensusReached: boolean;
}

export default function ChatInterface() {
  const { chatMessages, addChatMessage, isTyping, setIsTyping } = useStore();
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping, sessions]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isTyping) return;
    setInput('');
    setIsTyping(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    try {
      const data = await sendMessageToApi(msg);
      addChatMessage(data.finalDraft);
      setSessions((prev) => [
        ...prev,
        {
          userMsgId: userMsg.id,
          messages: data.messages,
          finalDraft: data.finalDraft,
          consensusReached: data.consensusReached,
        },
      ]);
    } catch (err) {
      console.error(err);
      addChatMessage({
        id: `err-${Date.now()}`,
        role: 'agent',
        content: 'Something went wrong. Check that all 4 API keys are set correctly.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userMessages = chatMessages.filter((m) => m.role === 'user');

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-[#111113]">
        <Brain className="w-5 h-5 text-purple-400" />
        <h1 className="text-base font-semibold text-white">CortexForge</h1>
        <span className="text-xs text-gray-500 ml-1">— 4-AI Brainstorm</span>
        <div className="ml-auto flex items-center gap-2">
          {(['openai', 'groq', 'deepseek', 'gemini'] as AiName[]).map((ai) => (
            <span key={ai} className={`text-xs font-medium px-2 py-0.5 rounded-full ${AI_CONFIG[ai].bg} ${AI_CONFIG[ai].color} ${AI_CONFIG[ai].border} border`}>
              {AI_CONFIG[ai].label}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {userMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-3">
            <Brain className="w-16 h-16 text-purple-400/20" />
            <p className="text-lg font-medium text-gray-400">Ask anything</p>
            <p className="text-sm text-center max-w-md">
              All 4 AIs will brainstorm together — reading each other's answers, building on ideas, and delivering one final collective answer.
            </p>
          </div>
        )}

        {userMessages.map((userMsg) => {
          const session = sessions.find((s) => s.userMsgId === userMsg.id);
          return (
            <div key={userMsg.id} className="space-y-2">
              {/* User message */}
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <div className="max-w-[80%]">
                  <div className="inline-block rounded-2xl px-4 py-3 text-sm bg-purple-600/10 border border-purple-500/20 text-white leading-relaxed">
                    {userMsg.content}
                  </div>
                </div>
              </div>

              {/* Brainstorm session or loading */}
              {session ? (
                <div className="pl-4">
                  <BrainstormBlock
                    sessionMessages={session.messages}
                    finalDraft={session.finalDraft}
                    consensusReached={session.consensusReached}
                  />
                </div>
              ) : isTyping ? (
                <div className="flex gap-3 pl-4">
                  <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      {(['openai', 'groq', 'deepseek', 'gemini'] as AiName[]).map((ai, i) => (
                        <span
                          key={ai}
                          className={`w-2 h-2 rounded-full animate-bounce ${AI_CONFIG[ai].color.replace('text-', 'bg-')}`}
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">4 AIs brainstorming...</span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 bg-[#111113] p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask all 4 AIs something... (Enter to send)"
            rows={1}
            disabled={isTyping}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl px-4 py-3 transition-all disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">
          Each response goes through 3 brainstorm rounds + consensus + final draft
        </p>
      </div>
    </div>
  );
}
