// ============================================================
// CortexForge — Backend API Server (Express + WebSocket)
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { corsMiddleware } from './middleware/cors.js';
import agentRoutes from './routes/agent.routes.js';
import chatRoutes from './routes/chat.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import { setupWebSocket } from './websocket.js';

const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3001;
const HOST = '0.0.0.0';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/agent', agentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', tasksRoutes);

// Create HTTP server and attach WebSocket
const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, HOST, () => {
  console.log(`[CortexForge API] Server running on http://${HOST}:${PORT}`);
  console.log(`[CortexForge API] WebSocket available at ws://${HOST}:${PORT}/ws`);
  console.log(`[CortexForge API] Health check: http://${HOST}:${PORT}/api/health`);
});

export default app;