// ============================================================
// Shared types for the CortexForge frontend
// ============================================================

export type CognitionStage = 'perception' | 'reasoning' | 'planning' | 'execution' | 'reflection';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type MemoryTab = 'working' | 'episodic' | 'semantic' | 'procedural';

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

export interface TaskNode {
  id: string;
  label: string;
  description: string;
  status: TaskStatus;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  reasoning?: string;
  timestamp: string;
  showReasoning?: boolean;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
}

export interface WsMessage {
  type: 'cognition' | 'log' | 'state' | 'memory' | 'task' | 'chat';
  data: unknown;
}