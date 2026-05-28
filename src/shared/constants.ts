export const SYSTEM_DEFAULTS = {
  MODEL_FAST: 'groq:llama-3-70b',
  MODEL_DEEP: 'openai:gpt-4o',
  MAX_CONCURRENCY: 5,
  MEMORY_RECALL_COUNT: 10,
  HEARTBEAT_INTERVAL_MS: 5000,
  TOKEN_LIMIT_DAILY: 1000000,
};

export const DB_PATHS = {
  EPISODIC: 'data/db/episodic.sqlite',
  SEMANTIC: 'data/db/semantic.sqlite',
  STATE: 'data/db/state.sqlite',
};

export const STORAGE_KEYS = {
  WORKING_MEMORY: 'cortexforge:working_memory',
  STATE: 'cortexforge:state',
};
