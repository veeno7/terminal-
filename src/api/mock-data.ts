// ============================================================
// Mock Data for the Backend API — simulates the core engine
// These will be replaced by real engine imports later
// ============================================================

import type {
  AgentState,
  AgentMemory,
  CognitionStatus,
  TaskBoard,
  ChatMessage,
} from '../shared/types/index.js';

// ─── Mock Agent State ────────────────────────────────────────

export const mockAgentState: AgentState = {
  identity: {
    name: 'CortexForge',
    baseDirective: 'An autonomous software engineer and researcher',
    tone: 'Professional, concise, uses technical terminology',
    constraints: [
      'Never delete files outside of the project directory',
      'Never execute untrusted code without user approval',
      'Always ask before spending money on third-party APIs',
    ],
  },
  vitals: {
    tokenUsage: { used: 124_567, limit: 1_000_000, percent: 12.5 },
    apiHealth: { groq: 'ok', openai: 'ok' },
    uptime: 86_400,
    memoryUsage: { heapUsed: 156_000_000, heapTotal: 512_000_000 },
  },
  motivation: {
    curiosity: 78,
    urgency: 34,
    focus: 92,
  },
  activeGoals: [
    {
      id: 'goal-1',
      description: 'Build and deploy the web interface for user interaction',
      priority: 'high',
      progress: 45,
      createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    },
    {
      id: 'goal-2',
      description: 'Integrate GitHub skill for repository management',
      priority: 'medium',
      progress: 20,
      createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    },
  ],
};

// ─── Mock Memory ─────────────────────────────────────────────

export const mockAgentMemory: AgentMemory = {
  working: [
    { key: 'current_context', value: 'Building the web interface', lastUpdated: new Date().toISOString() },
    { key: 'last_user_message', value: 'Show me the current state', lastUpdated: new Date().toISOString() },
    { key: 'active_goal_id', value: 'goal-1', lastUpdated: new Date(Date.now() - 600_000).toISOString() },
  ],
  episodic: [
    { id: 'ep-1', timestamp: new Date(Date.now() - 86_400_000).toISOString(), summary: 'Deployed initial backend API', taskId: 'task-1', outcome: 'success' },
    { id: 'ep-2', timestamp: new Date(Date.now() - 43_200_000).toISOString(), summary: 'Applied retry logic for GitHub rate limit', taskId: 'task-2', outcome: 'success' },
    { id: 'ep-3', timestamp: new Date(Date.now() - 7_200_000).toISOString(), summary: 'User requested task DAG visualization', outcome: 'info' },
  ],
  semantic: [
    { id: 'sf-1', fact: 'User prefers TypeScript over JavaScript', category: 'preference', confidence: 0.95 },
    { id: 'sf-2', fact: 'Project uses Tailwind CSS for styling', category: 'project', confidence: 0.9 },
    { id: 'sf-3', fact: 'Target deployment platform is Render', category: 'infrastructure', confidence: 0.85 },
    { id: 'sf-4', fact: 'Primary LLMs: Groq (reflex) + OpenAI (deliberation)', category: 'system', confidence: 0.98 },
  ],
  procedural: [
    { id: 'ps-1', skillName: 'git-push', usageCount: 47, lastUsed: new Date(Date.now() - 3_600_000).toISOString(), notes: 'Use --force-with-lease instead of --force' },
    { id: 'ps-2', skillName: 'docker-build', usageCount: 12, lastUsed: new Date(Date.now() - 172_800_000).toISOString(), notes: 'Multi-stage builds reduce image size by ~60%' },
    { id: 'ps-3', skillName: 'web-deploy', usageCount: 8, lastUsed: new Date(Date.now() - 86_400_000).toISOString(), notes: 'Always run build step before deploying to Render' },
  ],
};

// ─── Mock Cognition ──────────────────────────────────────────

export const mockCognitionStatus: CognitionStatus = {
  currentStage: 'reasoning',
  previousStage: 'perception',
  cycleCount: 1_247,
  startedAt: new Date(Date.now() - 300_000).toISOString(),
  description: 'Analyzing newly perceived sensor data and aligning with current goals',
  isIdle: false,
};

// ─── Mock Task Board (DAG) ──────────────────────────────────

export const mockTaskBoard: TaskBoard = {
  nodes: [
    { id: 'task-1', label: 'Scaffold Project', description: 'Set up TypeScript monorepo', status: 'completed', progress: 100 },
    { id: 'task-2', label: 'Build Core Engine', description: 'Implement cognition loop and memory', status: 'running', progress: 65, assignedSkill: 'core-architecture' },
    { id: 'task-3', label: 'Build API Server', description: 'Create Express + WebSocket server', status: 'running', progress: 40, assignedSkill: 'api-development' },
    { id: 'task-4', label: 'Build Web UI', description: 'Create React frontend with dashboard', status: 'running', progress: 25, assignedSkill: 'web-development' },
    { id: 'task-5', label: 'Integrate LLMs', description: 'Connect Groq and OpenAI', status: 'pending', progress: 0, assignedSkill: 'llm-integration' },
    { id: 'task-6', label: 'Build Skills', description: 'Implement skill framework', status: 'pending', progress: 0, assignedSkill: 'skill-framework' },
    { id: 'task-7', label: 'Testing & QA', description: 'Run test suite', status: 'pending', progress: 0 },
    { id: 'task-8', label: 'Deploy to Render', description: 'Deploy all services', status: 'pending', progress: 0 },
  ],
  edges: [
    { id: 'e-1-2', source: 'task-1', target: 'task-2' },
    { id: 'e-1-3', source: 'task-1', target: 'task-3' },
    { id: 'e-1-4', source: 'task-1', target: 'task-4' },
    { id: 'e-2-5', source: 'task-2', target: 'task-5' },
    { id: 'e-2-6', source: 'task-2', target: 'task-6' },
    { id: 'e-3-7', source: 'task-3', target: 'task-7' },
    { id: 'e-4-7', source: 'task-4', target: 'task-7' },
    { id: 'e-5-7', source: 'task-5', target: 'task-7' },
    { id: 'e-6-7', source: 'task-6', target: 'task-7' },
    { id: 'e-7-8', source: 'task-7', target: 'task-8' },
  ],
};

// ─── Mock Chat History ───────────────────────────────────────

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Hey CortexForge, what can you do?',
    timestamp: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'msg-2',
    role: 'agent',
    content: "I'm a fully autonomous AI agent. I can write code, deploy infrastructure, manage files, browse the web, interact with APIs, and much more. I operate through a sophisticated cognitive loop — I perceive my environment, reason about goals, plan actions, execute skills, and reflect on outcomes. What would you like me to help you with?",
    reasoning: 'User is asking about capabilities. I should give a comprehensive overview.',
    timestamp: new Date(Date.now() - 3590_000).toISOString(),
  },
  {
    id: 'msg-3',
    role: 'user',
    content: "Show me your current state and what you're working on",
    timestamp: new Date(Date.now() - 3000_000).toISOString(),
  },
  {
    id: 'msg-4',
    role: 'agent',
    content: "Here's a snapshot of my current state:\n\n**Active Goals:**\n1. Build and deploy the web interface (45%)\n2. Integrate GitHub skill (20%)\n\n**Cognition:** 'Reasoning' stage\n\n**Motivation:** Focus 92, Curiosity 78, Urgency 34\n\n**Token Budget:** 12.5% used",
    reasoning: 'User wants state introspection. Provide concise operational summary.',
    timestamp: new Date(Date.now() - 2990_000).toISOString(),
    showReasoning: true,
  },
];
