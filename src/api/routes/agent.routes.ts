// ============================================================
// Agent Routes — state, memory, cognition, logs
// ============================================================

import { Router } from 'express';
import {
  getAgentState,
  getAgentMemory,
  getCognition,
  getAgentLogs,
} from '../controllers/agent.controller.js';

const router = Router();

router.get('/state', getAgentState);
router.get('/memory', getAgentMemory);
router.get('/cognition', getCognition);
router.get('/logs', getAgentLogs);

export default router;