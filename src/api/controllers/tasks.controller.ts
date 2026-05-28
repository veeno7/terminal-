import { Request, Response } from 'express';
import { engine } from '../../engine.js';

/** GET /api/tasks — returns the full task board with DAG data */
export function getTasks(_req: Request, res: Response) {
  const status = engine.orchestrator.getStatus();
  // Transform orchestrator status to TaskBoard format if needed
  // For now, returning the raw status from orchestrator
  res.json(status);
}

/** POST /api/tasks — create a new task/goal */
export async function createTask(req: Request, res: Response) {
  const { title, description, priority, dependencies } = req.body;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Task title is required' });
    return;
  }

  // Assuming orchestrator has a way to add tasks
  // For now, we'll just log and return a placeholder
  console.log(`[TasksController] Creating task: ${title}`);
  
  res.status(201).json({ message: 'Task creation via API not fully implemented yet' });
}

/** PATCH /api/tasks/:id — update a task's status or progress */
export function updateTask(req: Request, res: Response) {
  const { id } = req.params;
  const { status, result } = req.body;

  // Update logic in orchestrator
  res.json({ message: 'Task update via API not fully implemented yet' });
}
