// ============================================================
// WebSocket Hook — real-time agent state streaming
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { WsMessage } from '../types';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    setAgentState,
    setAgentMemory,
    setCognition,
    addLog,
    setTaskBoard,
    addChatMessage,
  } = useStore();

  const connect = useCallback(() => {
    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('[WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'state':
            setAgentState(message.data as any);
            break;
          case 'cognition':
            setCognition(message.data as any);
            break;
          case 'memory':
            setAgentMemory(message.data as any);
            break;
          case 'task':
            setTaskBoard(message.data as any);
            break;
          case 'log':
            addLog(message.data as any);
            break;
          case 'chat':
            addChatMessage(message.data as any);
            break;
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 3s...');
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      ws.close();
    };
  }, [setAgentState, setAgentMemory, setCognition, addLog, setTaskBoard, addChatMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return wsRef;
}