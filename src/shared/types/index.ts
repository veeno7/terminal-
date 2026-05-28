// ============================================================
// Shared Types for CortexForge — used by API, Frontend, and Core
// ============================================================

/** The five stages of the cognition loop */
export type CognitionStage = 'perception' | 'reasoning' | 'planning' | 'execution' | 'reflection';

/** Task status for the DAG task board */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';

/** Memory tier names */
export type MemoryTier = 'working' | 'episodic' | 'semantic' | 'procedural';

// ─── Core Engine Types ─────────────────────────────────────────

export interface CognitionLoop {
  id: string;
  status: 'active' | 'idle' | 'sleeping' | 'error';
  startTime: Date;
  lastHeartbeat: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  dependencies: string[];
  priority: number;
  result?: any;
  error?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  goalId: string;
  tasks: Task[];
  status: 'active' | 'completed' | 'failed';
}

export interface Goal {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: number;
  deadline?: Date;
  successCriteria: string[];
  createdAt: Date;
}

export interface Skill {
  name: string;
  description: string;
  parameters: any;
  category: string;
  permissions: string[];
  version: string;
  path: string;
}

export interface InternalState {
  identity: {
    name: string;
    persona: string;
    baseDirective: string;
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
    apiHealth: Record<string, boolean>;
    computeLoad: number;
  };
  preferences: Record<string, any>;
}

export interface Observation {
  taskId: string;
  status: 'success' | 'failure';
  data: any;
  error?: string;
  timestamp: Date;
}

// ─── Memory Types ──────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'working';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  embedding?: number[];
}

export interface WorkingMemoryEntry {
  key: string;
  value: string;
  lastUpdated: string;
}

export interface EpisodicEvent {
  id: string;
  timestamp: string;
  summary: string;
  taskId?: string;
  outcome: 'success' | 'failure' | 'info';
}

export interface SemanticFact {
  id: string;
  fact: string;
  category: string;
  confidence: number;
}

export interface ProceduralSkill {
  id: string;
  skillName: string;
  usageCount: number;
  lastUsed: string;
  notes: string;
}

// ─── Frontend-facing Types ─────────────────────────────────────

export interface AgentIdentity {
  name: string;
  baseDirective: string;
  tone: string;
  constraints: string[];
}

export interface AgentVitals {
  tokenUsage: { used: number; limit: number; percent: number };
  apiHealth: { groq: 'ok' | 'error'; openai: 'ok' | 'error' };
  uptime: number;
  memoryUsage: { heapUsed: number; heapTotal: number };
}

export interface MotivationalState {
  curiosity: number;
  urgency: number;
  focus: number;
}

export interface ActiveGoal {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  createdAt: string;
}

export interface AgentState {
  identity: AgentIdentity;
  vitals: AgentVitals;
  motivation: MotivationalState;
  activeGoals: ActiveGoal[];
}

export interface AgentMemory {
  working: WorkingMemoryEntry[];
  episodic: EpisodicEvent[];
  semantic: SemanticFact[];
  procedural: ProceduralSkill[];
}

export interface CognitionStatus {
  currentStage: CognitionStage;
  previousStage: CognitionStage | null;
  cycleCount: number;
  startedAt: string;
  description: string;
  isIdle: boolean;
}

// ─── Task Board (DAG) ──────────────────────────────────────────

export interface TaskNode {
  id: string;
  label: string;
  description: string;
  status: string;
  assignedSkill?: string;
  result?: string;
  progress: number;
}

export interface TaskEdge {
  id: string;
  source: string;
  target: string;
}

export interface TaskBoard {
  nodes: TaskNode[];
  edges: TaskEdge[];
}

// ─── Chat ──────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  reasoning?: string;
  timestamp: string;
  showReasoning?: boolean;
}

// ─── WebSocket Event Types ─────────────────────────────────────

export interface WsCognitionUpdate {
  type: 'cognition';
  data: CognitionStatus;
}

export interface WsLogUpdate {
  type: 'log';
  data: { message: string; level: string; timestamp: string };
}

export interface WsStateUpdate {
  type: 'state';
  data: AgentState;
}

export interface WsMemoryUpdate {
  type: 'memory';
  data: AgentMemory;
}

export interface WsTaskUpdate {
  type: 'task';
  data: TaskBoard;
}

export interface WsChatUpdate {
  type: 'chat';
  data: ChatMessage;
}

export type WsMessage = WsCognitionUpdate | WsLogUpdate | WsStateUpdate | WsMemoryUpdate | WsTaskUpdate | WsChatUpdate;
