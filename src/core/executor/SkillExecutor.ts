import { Observation } from '../../shared/types/index.js';
import { SkillRegistry } from './SkillRegistry.js';
import { MemoryManager } from '../memory/MemoryManager.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { z } from 'zod';

export class SkillExecutor {
  constructor(
    private registry: SkillRegistry,
    private memory: MemoryManager
  ) {}

  async execute(skillName: string, parameters: any): Promise<Observation> {
    const skill = this.registry.getSkill(skillName);
    if (!skill) {
      return this.createFailure(uuidv4(), `Skill ${skillName} not found`);
    }

    const taskId = uuidv4();
    console.log(`[SkillExecutor] Executing skill: ${skillName} (${skill.path})`);

    try {
      const modulePath = path.isAbsolute(skill.path) ? `file://${skill.path}` : `file://${path.resolve(process.cwd(), skill.path)}`;
      const skillModule = await import(modulePath);

      if (typeof skillModule.execute !== 'function') {
        throw new Error(`Skill ${skillName} does not export an execute function`);
      }

      if (skillModule.schema) {
        console.log(`[SkillExecutor] Validating parameters for ${skillName}`);
        const validatedParams = skillModule.schema.parse(parameters);
        parameters = validatedParams;
      }

      const start = Date.now();
      const result = await skillModule.execute(parameters);
      const duration = Date.now() - start;

      const observation: Observation = {
        taskId,
        status: result.success ? 'success' : 'failure',
        data: result.data || null,
        error: result.error,
        timestamp: new Date()
      };

      await this.memory.episodic.record(`Executed skill ${skillName}`, {
        skillName,
        parameters,
        status: observation.status,
        duration,
        error: observation.error
      });

      if (observation.status === 'success') {
        await this.memory.procedural.recordSkillSuccess(skillName, parameters, observation.data);
      } else {
        await this.memory.procedural.recordSkillFailure(skillName, parameters, observation.error || 'Unknown error');
      }

      return observation;
    } catch (error: any) {
      console.error(`[SkillExecutor] Error executing ${skillName}:`, error);

      let errorMessage = error.message;
      if (error instanceof z.ZodError) {
        errorMessage = `Validation Error: ${JSON.stringify(error.issues)}`;
      }

      const observation = this.createFailure(taskId, errorMessage);

      await this.memory.episodic.record(`Failed to execute skill ${skillName}`, {
        skillName,
        parameters,
        error: errorMessage
      });

      return observation;
    }
  }

  private createFailure(taskId: string, error: string): Observation {
    return {
      taskId,
      status: 'failure',
      data: null,
      error,
      timestamp: new Date()
    };
  }
}
