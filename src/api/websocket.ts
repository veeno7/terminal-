import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WsMessage } from '../shared/types/index.js';

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS] Client connected');

    // Send initial cognition state
    const initMsg: WsMessage = {
      type: 'cognition',
      data: {
        currentStage: 'perception',
        previousStage: null,
        cycleCount: 0,
        startedAt: new Date().toISOString(),
        description: 'CortexForge cognitive engine initializing...',
        isIdle: false,
      },
    };
    ws.send(JSON.stringify(initMsg));

    // Simulate cognition cycle updates every 5 seconds
    const stages = ['perception', 'reasoning', 'planning', 'execution', 'reflection'] as const;
    let cycleCount = 0;
    let stageIndex = 0;

    const interval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval);
        return;
      }

      const currentStage = stages[stageIndex];
      const prevStage = stageIndex > 0 ? stages[stageIndex - 1] : null;

      // Send cognition update
      const update: WsMessage = {
        type: 'cognition',
        data: {
          currentStage,
          previousStage: prevStage,
          cycleCount: Math.floor(cycleCount / 5),
          startedAt: new Date().toISOString(),
          description: `[${currentStage.toUpperCase()}] Processing cognitive cycle...`,
          isIdle: false,
        },
      };
      ws.send(JSON.stringify(update));

      // Send log for each stage
      const logMsg: WsMessage = {
        type: 'log',
        data: {
          level: 'info',
          message: `[${currentStage.toUpperCase()}] Cycle ${Math.floor(cycleCount / 5) + 1}: Entering ${currentStage} stage`,
          timestamp: new Date().toISOString(),
        },
      };
      ws.send(JSON.stringify(logMsg));

      stageIndex++;
      cycleCount++;
      if (stageIndex >= stages.length) {
        stageIndex = 0;
      }
    }, 5000);

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
      clearInterval(interval);
    });
  });

  return wss;
}

export function broadcast(wss: WebSocketServer, message: WsMessage) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
