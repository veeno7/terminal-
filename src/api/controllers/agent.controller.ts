import { Request, Response } from 'express';
import { engine } from '../../engine.js';

/** GET /api/agent/state */
export function getAgentState(_req: Request, res: Response) {
  res.json(engine.state.getState());
}

/** GET /api/agent/memory */
export async function getAgentMemory(req: Request, res: Response) {
  const type = req.query.type as string;
  const query = req.query.q as string;
  
  if (query) {
    const results = await engine.memory.globalRecall(query);
    return res.json({ results });
  }

  // Return status or summary if no query
  res.json(engine.memory.getStatus());
}

/** GET /api/agent/cognition */
export function getCognition(_req: Request, res: Response) {
  res.json(engine.loop.getStatus());
}

/** GET /api/agent/logs */
export function getAgentLogs(_req: Request, res: Response) {
  // In a real system, read from data/logs/cognition.log
  res.json([]);
}
