// ============================================================
// API Client — REST requests to the CortexForge backend
// ============================================================

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  /** Get full agent state */
  getAgentState: () => request<any>('/agent/state'),

  /** Get agent memory (all tiers) */
  getAgentMemory: () => request<any>('/agent/memory'),

  /** Get current cognition status */
  getCognition: () => request<any>('/agent/cognition'),

  /** Get cognition logs */
  getAgentLogs: () => request<any[]>('/agent/logs'),

  /** Get task board with DAG data */
  getTasks: () => request<any>('/tasks'),

  /** Create a new task */
  createTask: (label: string, description?: string) =>
    request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ label, description }),
    }),

  /** Update a task */
  updateTask: (id: string, data: { status?: string; progress?: number; result?: string }) =>
    request<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** Get chat history */
  getChatHistory: () => request<any[]>('/chat'),

  /** Send a message to the agent */
  sendMessage: (message: string) =>
    request<{ userMessage: any; agentMessage: any }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  /** Health check */
  health: () => request<{ status: string }>('/health'),
};