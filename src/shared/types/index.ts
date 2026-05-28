// ─── Multi-AI Brainstorm Types ──────────────────────────────

export type AiName = 'openai' | 'groq' | 'deepseek' | 'gemini';
export type BrainstormRound = 1 | 2 | 3 | 'consensus' | 'draft';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  reasoning?: string;
  timestamp: string;
  showReasoning?: boolean;
  // Brainstorm fields
  aiName?: AiName;
  round?: BrainstormRound;
  replyTo?: AiName | 'all';
  vote?: boolean;
  isFinalDraft?: boolean;
  skillResults?: Array<{
    skillName: string;
    params: Record<string, unknown>;
    success: boolean;
    result: string;
  }>;
}

export interface BrainstormResponse {
  userMessage: ChatMessage;
  messages: ChatMessage[];
  finalDraft: ChatMessage;
  consensusReached: boolean;
}

// ─── Skill Types ─────────────────────────────────────────────

export interface Skill {
  name: string;
  description: string;
  path: string;
  version?: string;
  tags?: string[];
}

export interface Observation {
  type: string;
  data: unknown;
  timestamp: Date;
}

// ─── Memory Types ─────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// ─── Goal / Plan / Task Types ─────────────────────────────────

export interface Goal {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  createdAt: string;
}

export interface Task {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  assignedSkill?: string;
  dependencies?: string[];
}

export interface Plan {
  id: string;
  goalId: string;
  tasks: Task[];
  createdAt: string;
}

// ─── Cognition Types ──────────────────────────────────────────

export type CognitionStage = 'perception' | 'reasoning' | 'planning' | 'execution' | 'reflection' | 'sleeping';

export interface CognitionLoop {
  id: string;
  status: 'idle' | 'active' | 'sleeping' | 'error';
  startTime: Date;
  lastHeartbeat: Date;
}

export interface CognitionStatus {
  currentStage: string;
  previousStage: string | null;
  cycleCount: number;
  startedAt: string;
  description: string;
  isIdle: boolean;
}

// ─── Internal State Types ─────────────────────────────────────

export interface InternalState {
  identity: {
    name: string;
    persona?: string;
    baseDirective: string;
    tone?: string;
    constraints: string[];
  };
  motivation: {
    curiosity: number;
    urgency: number;
    focus: number;
  };
  vitals: {
    tokenUsage: number;
    tokenLimit: number;
    apiHealth: Record<string, unknown>;
    computeLoad: number;
  };
  preferences: Record<string, unknown>;
}

// ─── Agent State (UI / API) ───────────────────────────────────

export interface AgentState {
  identity: {
    name: string;
    baseDirective: string;
    tone: string;
    constraints: string[];
  };
  vitals: {
    tokenUsage: { used: number; limit: number; percent: number };
    apiHealth: Record<string, string>;
    uptime: number;
    memoryUsage: { heapUsed: number; heapTotal: number };
  };
  motivation: {
    curiosity: number;
    urgency: number;
    focus: number;
  };
  activeGoals: Goal[];
}

// ─── Memory (UI / API) ────────────────────────────────────────

export interface AgentMemory {
  working: Array<{ key: string; value: string; lastUpdated: string }>;
  episodic: Array<{ id: string; timestamp: string; summary: string; taskId?: string; outcome: string }>;
  semantic: Array<{ id: string; fact: string; category: string; confidence: number }>;
  procedural: Array<{ id: string; skillName: string; usageCount: number; lastUsed: string; notes: string }>;
}

// ─── Task Board (UI / API) ────────────────────────────────────

export interface TaskBoard {
  nodes: Array<{
    id: string;
    label: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    assignedSkill?: string;
  }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

// ─── WebSocket Message ────────────────────────────────────────

export interface WsMessage {
  type: 'cognition' | 'log' | 'task' | 'memory' | 'state' | 'chat';
  data: unknown;
}
