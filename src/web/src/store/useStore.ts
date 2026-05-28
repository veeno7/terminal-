import { create } from 'zustand';
import type { AgentState, AgentMemory, CognitionStatus, TaskBoard, ChatMessage, LogEntry, CognitionStage } from '../types';

interface AppState {
  agentState: AgentState | null;
  agentMemory: AgentMemory | null;
  cognition: CognitionStatus | null;
  logs: LogEntry[];
  taskBoard: TaskBoard | null;
  chatMessages: ChatMessage[];
  isTyping: boolean;
  activeView: 'chat' | 'dashboard' | 'settings';
  cognitionStageHistory: CognitionStage[];

  setAgentState: (state: AgentState) => void;
  setAgentMemory: (memory: AgentMemory) => void;
  setCognition: (cognition: CognitionStatus) => void;
  addLog: (log: LogEntry) => void;
  setTaskBoard: (board: TaskBoard) => void;
  addChatMessage: (msg: ChatMessage) => void;
  addChatMessages: (msgs: ChatMessage[]) => void;
  setIsTyping: (typing: boolean) => void;
  setActiveView: (view: 'chat' | 'dashboard' | 'settings') => void;
  toggleReasoning: (msgId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  agentState: null,
  agentMemory: null,
  cognition: null,
  logs: [],
  taskBoard: null,
  chatMessages: [],
  isTyping: false,
  activeView: 'chat',
  cognitionStageHistory: [],

  setAgentState: (state) => set({ agentState: state }),
  setAgentMemory: (memory) => set({ agentMemory: memory }),
  setCognition: (cognition) =>
    set((state) => ({
      cognition,
      cognitionStageHistory: [...state.cognitionStageHistory.slice(-50), cognition.currentStage],
    })),
  addLog: (log) => set((state) => ({ logs: [...state.logs.slice(-200), log] })),
  setTaskBoard: (board) => set({ taskBoard: board }),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  addChatMessages: (msgs) => set((state) => ({ chatMessages: [...state.chatMessages, ...msgs] })),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setActiveView: (view) => set({ activeView: view }),
  toggleReasoning: (msgId) =>
    set((state) => ({
      chatMessages: state.chatMessages.map((m) =>
        m.id === msgId ? { ...m, showReasoning: !m.showReasoning } : m
      ),
    })),
}));
