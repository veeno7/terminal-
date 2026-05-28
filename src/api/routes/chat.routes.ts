// ============================================================
// Chat Routes — send and receive messages
// ============================================================

import { Router } from 'express';
import { getChatHistory, sendMessage } from '../controllers/chat.controller.js';

const router = Router();

router.get('/', getChatHistory);
router.post('/', sendMessage);

export default router;