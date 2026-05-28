import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Send, User, Brain, CheckCircle, XCircle, FileText, Zap, AlertCircle } from 'lucide-react';
import type { ChatMessage, AiName, BrainstormRound, BrainstormResponse } from '../types';

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

interface SkillResult { skillName: string; success: boolean; result: string; }

function renderContent(content: string) {
  const parts = content.split(/(@(?:openai|groq|deepseek|gemini|all)\b)/gi);
  return parts.map((part, i) => {
    if (part.match(/^@(?:openai|groq|deepseek|gemini|all)$/i)) {
      const key = part.slice(1).toLowerCase() as AiName | 'all';
      const cfg = key !== 'all' ? AI_CONFIG[key as AiName] : null;
      return <span key={i} className={`font-semibold px-1 rounded ${cfg ? cfg.color : 'text-yellow-400'}`}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function SkillBadges({ skillResults }: { skillResults: SkillResult[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!skillResults?.length) return null;
  return (
    <div className="mt-2 space-y-1">
      {skillResults.map((s, i) => (
        <div key={i} className="text-xs">
          <button
            onClick={() => setExpanded(expanded === s.skillName + i ? null : s.skillName + i)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
              s.success ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {s.success ? <Zap className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            <span>{s.skillName}</span>
            <span className="opacity-50">{expanded === s.skillName + i ? '▾' : '▸'}</span>
          </button>
          {expanded === s.skillName + i && (
            <pre className="mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 overflow-x-auto whitespace-pre-wrap text-[11px] max-h-40">
              {s.result}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function AiMessageCard({ msg }: { msg: ChatMessage & { skillResults?: SkillResult[] } }) {
  const ai = msg.aiName ? AI_CONFIG[msg.aiName] : null;
  if (!ai) return null;
  return (
    <div className={`rounded-xl p-4 border ${ai.bg} ${ai.border}`}>
      <div className={`text-xs font-semibold mb-2 ${ai.color}`}>{ai.label}</div>
      <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
        {renderContent(msg.content)}
      </div>
      {msg.skillResults && <SkillBadges skillResults={msg.skillResults} />}
    </div>
  );
}

function RoundSection({ round, messages }: { round: BrainstormRound; messages: (ChatMessage & { skillResults?: SkillResult[] })[] }) {
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
                  {msg.vote ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
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
          {messages.map((msg) => <AiMessageCard key={msg.id} msg={msg} />)}
        </div>
      )}
    </div>
  );
}

function BrainstormBlock({ sessionMessages, finalDraft, consensusReached }: {
  sessionMessages: (ChatMessage & { skillResults?: SkillResult[] })[];
  finalDraft: ChatMessage;
  consensusReached: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const rounds = [1, 2, 3, 'consensus'] as const;
  const roundMap = rounds.reduce<Record<string, (ChatMessage & { skillResults?: SkillResult[] })[]>>((acc, r) => {
    acc[String(r)] = sessionMessages.filter((m) => String(m.round) === String(r));
    return acc;
  }, {});

  const totalSkillCalls = sessionMessages.reduce((n, m) => n + (m.skillResults?.length ?? 0), 0);

  return (
    <div className="mt-3 space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2"
      >
        {expanded ? '▾' : '▸'} {expanded ? 'Hide' : 'Show'} brainstorm ({sessionMessages.length} messages
        {totalSkillCalls > 0 && <span className="text-emerald-500">, {totalSkillCalls} skills used</span>})
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

      <div className={`flex items-center gap-2 text-xs ${consensusReached ? 'text-emerald-400' : 'text-yellow-400'}`}>
        {consensusReached ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        {consensusReached ? 'All 4 AIs reached consensus' : 'Partial consensus — draft based on majority'}
      </div>

      <div className="rounded-xl border border-orange-400/30 bg-orange-400/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-400">Final Draft — by Groq</span>
          <span className="text-xs text-gray-500">(collective output of all 4 AIs)</span>
        </div>
        <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{finalDraft.content}</div>
      </div>
    </div>
  );
}

const API_BASE = (import.meta as { env: { VITE_API_URL?: string } }).env.VITE_API_URL ?? 'http://localhost:3001';

async function sendMessageToApi(message: string): Promise<BrainstormResponse> {
  const res = await fetch(`${API_BASE}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<BrainstormResponse>;
}

interface SessionData {
  userMsgId: string;
  messages: (ChatMessage & { skillResults?: SkillResult[] })[];
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
      setSessions((prev) => [...prev, {
        userMsgId: userMsg.id,
        messages: data.messages as (ChatMessage & { skillResults?: SkillResult[] })[],
        finalDraft: data.finalDraft,
        consensusReached: data.consensusReached,
      }]);
    } catch (err) {
      console.error(err);
      addChatMessage({
        id: `err-${Date.now()}`,
        role: 'agent',
        content: 'Something went wrong. Check that all 4 API keys are set in your .env file.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const userMessages = chatMessages.filter((m) => m.role === 'user');

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-[#111113]">
        <Brain className="w-5 h-5 text-purple-400" />
        <h1 className="text-base font-semibold text-white">CortexForge</h1>
        <span className="text-xs text-gray-500 ml-1">— 4-AI Brainstorm</span>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {(['openai', 'groq', 'deepseek', 'gemini'] as AiName[]).map((ai) => (
            <span key={ai} className={`text-xs font-medium px-2 py-0.5 rounded-full ${AI_CONFIG[ai].bg} ${AI_CONFIG[ai].color} ${AI_CONFIG[ai].border} border`}>
              {AI_CONFIG[ai].label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {userMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-3">
            <Brain className="w-16 h-16 text-purple-400/20" />
            <p className="text-lg font-medium text-gray-400">Ask anything</p>
            <p className="text-sm text-center max-w-md text-gray-500">
              All 4 AIs brainstorm together across 3 rounds. They can invoke 35+ skills (devops, AI, security, data, and more) to fetch real results during their discussion.
            </p>
          </div>
        )}

        {userMessages.map((userMsg) => {
          const session = sessions.find((s) => s.userMsgId === userMsg.id);
          return (
            <div key={userMsg.id} className="space-y-2">
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

              {session ? (
                <div className="pl-4">
                  <BrainstormBlock sessionMessages={session.messages} finalDraft={session.finalDraft} consensusReached={session.consensusReached} />
                </div>
              ) : isTyping ? (
                <div className="flex gap-3 pl-4">
                  <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      {(['openai', 'groq', 'deepseek', 'gemini'] as AiName[]).map((ai, i) => (
                        <span key={ai} className={`w-2 h-2 rounded-full animate-bounce ${AI_CONFIG[ai].color.replace('text-', 'bg-')}`} style={{ animationDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">4 AIs brainstorming + using skills...</span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

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
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl px-4 py-3 transition-all disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">
          3 rounds + consensus + final draft · 35+ skills available to all AIs
        </p>
      </div>
    </div>
  );
}
