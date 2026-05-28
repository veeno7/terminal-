// ============================================================
// Tasks Routes — task board CRUD
// ============================================================

import { Router } from 'express';
import { getTasks, createTask, updateTask } from '../controllers/tasks.controller.js';

const router = Router();

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);

export default router;