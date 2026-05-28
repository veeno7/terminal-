// ============================================================
// Chat Routes — send and receive messages
// ============================================================

import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller.js';

const router = Router();

router.post('/', handleChat);

export default router;
