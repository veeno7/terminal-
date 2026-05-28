import { Goal, Plan, Task } from '../../shared/types/index.js';
import { MemoryManager } from '../memory/MemoryManager.js';
import { SkillRegistry } from '../executor/SkillRegistry.js';
import { SkillExecutor } from '../executor/SkillExecutor.js';
import { ModelService } from '../loop/ModelService.js';
import { v4 as uuidv4 } from 'uuid';

export class Orchestrator {
  private activePlan: Plan | null = null;
  private executor: SkillExecutor;
  private modelService: ModelService;

  constructor(
    private memory: MemoryManager,
    private skillRegistry: SkillRegistry
  ) {
    this.executor = new SkillExecutor(skillRegistry, memory);
    this.modelService = new ModelService();
  }

  async initialize() {
  }

  async createPlan(goal: Goal): Promise<Plan> {
    const context = await this.memory.globalRecall(goal.description);
    console.log(`Decomposing goal: ${goal.description} with context...`);

    const tasks: Task[] = [
      {
        id: uuidv4(),
        title: 'Strategy Formulation',
        description: `Plan how to achieve: ${goal.description}`,
        status: 'pending',
        dependencies: [],
        priority: 1,
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const plan: Plan = {
      id: uuidv4(),
      goalId: goal.id,
      tasks,
      status: 'active'
    };

    this.activePlan = plan;
    return plan;
  }

  async runStep() {
    if (!this.activePlan) return;

    const pendingTasks = this.activePlan.tasks.filter((t: Task) => t.status === 'pending');
    for (const task of pendingTasks) {
      const dependenciesMet = task.dependencies.every((depId: string) => {
        const dep = this.activePlan?.tasks.find((t: Task) => t.id === depId);
        return dep?.status === 'completed';
      });

      if (dependenciesMet) {
        await this.executeTask(task);
      }
    }

    const allDone = this.activePlan.tasks.every((t: Task) => t.status === 'completed');
    if (allDone) {
      this.activePlan.status = 'completed';
    }
  }

  private async executeTask(task: Task) {
    task.status = 'running';
    task.updatedAt = new Date();

    try {
      const observation = await this.executor.execute('system-shell', {
        command: `echo "Executing task: ${task.title}"`
      });

      if (observation.status === 'success') {
        task.status = 'completed';
        task.result = observation.data;
        await this.memory.procedural.recordSkillSuccess('system-shell', { cmd: '...' }, observation.data);
      } else {
        task.status = 'failed';
        task.error = observation.error;
        await this.memory.procedural.recordSkillFailure('system-shell', { cmd: '...' }, observation.error ?? 'Unknown error');
      }
    } catch (err: unknown) {
      task.status = 'failed';
      task.error = err instanceof Error ? err.message : String(err);
    }

    task.updatedAt = new Date();
  }

  interrupt() {
    console.log('Orchestrator Interrupt Received');
    if (this.activePlan) {
      this.activePlan.status = 'failed';
    }
  }

  getStatus() {
    return {
      hasActivePlan: !!this.activePlan && this.activePlan.status === 'active',
      plan: this.activePlan
    };
  }
}
