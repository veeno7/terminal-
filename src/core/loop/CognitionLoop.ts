import { StateManager } from '../state/StateManager.js';
import { MemoryManager } from '../memory/MemoryManager.js';
import { Orchestrator } from '../planner/Orchestrator.js';
import { ModelService } from './ModelService.js';
import { CognitionLoop, Goal } from '../../shared/types/index.js';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

export type CognitionUpdateCallback = (update: any) => void;

export class CognitionLoopManager {
  private loopState: CognitionLoop;
  private isRunning: boolean = false;
  private logger: winston.Logger;
  private modelService: ModelService;
  private onUpdate: CognitionUpdateCallback | null = null;

  constructor(
    private state: StateManager,
    private memory: MemoryManager,
    private orchestrator: Orchestrator
  ) {
    this.loopState = {
      id: uuidv4(),
      status: 'idle',
      startTime: new Date(),
      lastHeartbeat: new Date()
    };

    this.modelService = new ModelService();

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'data/logs/cognition.log' })
      ]
    });
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loopState.status = 'active';
    this.logger.info('Cognition Loop Started');
    this.run();
  }

  async stop() {
    this.isRunning = false;
    this.loopState.status = 'idle';
    this.logger.info('Cognition Loop Stopped');
  }

  private async run() {
    while (this.isRunning) {
      try {
        await this.cycle();
        this.loopState.lastHeartbeat = new Date();
        
        // Dynamic wait time based on state
        const state = this.state.getState();
        const waitTime = state.motivation.urgency > 0.8 ? 2000 : 5000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } catch (error) {
        this.logger.error('Critical error in cognition loop:', error);
        this.loopState.status = 'error';
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  public setOnUpdate(callback: CognitionUpdateCallback) {
    this.onUpdate = callback;
  }

  private broadcastUpdate(type: string, data: any) {
    if (this.onUpdate) {
      this.onUpdate({ type, data, timestamp: new Date() });
    }
  }

  private async cycle() {
    const cycleId = uuidv4().substring(0, 8);
    this.logger.info(`--- Cycle ${cycleId} Start ---`);
    this.broadcastUpdate('cycle_start', { cycleId });

    // 1. Perception: Gather inputs and sensors
    this.broadcastUpdate('stage_start', { stage: 'perception' });
    const perceptions = await this.perceive();
    this.broadcastUpdate('stage_end', { stage: 'perception', summary: perceptions.summary });
    
    // Update vitals based on perceptions
    await this.state.setVitals({
      computeLoad: perceptions.vitals.computeLoad,
      apiHealth: perceptions.vitals.apiHealth
    });
    
    // 2. Reasoning: Contextualize and decide intent
    this.broadcastUpdate('stage_start', { stage: 'reasoning' });
    const reasoning = await this.reason(perceptions);
    this.logger.info(`Reasoning Result: ${reasoning.intent}`);
    this.broadcastUpdate('stage_end', { stage: 'reasoning', intent: reasoning.intent, reasoning: reasoning.reasoning });

    // 3. Planning: Decompose goals or adjust strategy
    this.broadcastUpdate('stage_start', { stage: 'planning' });
    const planAction = await this.plan(reasoning);
    this.broadcastUpdate('stage_end', { stage: 'planning', action: planAction });

    // 4. Execution: Run tasks
    if (planAction === 'execute') {
      this.broadcastUpdate('stage_start', { stage: 'execution' });
      await this.execute();
      this.broadcastUpdate('stage_end', { stage: 'execution' });
    } else if (planAction === 'sleep') {
      this.broadcastUpdate('stage_start', { stage: 'sleeping' });
      await this.sleepCycle();
      this.broadcastUpdate('stage_end', { stage: 'sleeping' });
    }

    // 5. Reflection: Self-assess and consolidate
    this.broadcastUpdate('stage_start', { stage: 'reflection' });
    await this.reflect(cycleId, reasoning);
    this.broadcastUpdate('stage_end', { stage: 'reflection' });
    
    this.logger.info(`--- Cycle ${cycleId} End ---`);
    this.broadcastUpdate('cycle_end', { cycleId });
  }

  private async perceive() {
    this.logger.info('Stage 1: Perception');
    const state = this.state.getState();
    
    // Summary of current internal state as context
    const stateSummary = `Current identity: ${state.identity.name}. Vitals: Load=${state.vitals.computeLoad}, Tokens=${state.vitals.tokenUsage}/${state.vitals.tokenLimit}`;
    
    // Mock perceptions
    const rawPerceptions = {
      timestamp: new Date(),
      vitals: {
        computeLoad: Math.random(),
        apiHealth: { 'openai': true, 'groq': true }
      },
      externalEvents: [] 
    };

    // Summarize inputs using ModelService
    const perceptionSummary = await this.modelService.fastReasoning(
      `Summarize these perceptions and system state: ${JSON.stringify(rawPerceptions)}`,
      stateSummary
    );

    return {
      ...rawPerceptions,
      summary: perceptionSummary
    };
  }

  private async reason(perceptions: any) {
    this.logger.info('Stage 2: Reasoning');
    const state = this.state.getState();
    const globalContext = await this.memory.globalRecall('current goal and state');
    
    const prompt = `
      Based on the following perceptions and context, determine the next best intent for the agent.
      Perceptions: ${perceptions.summary}
      Context: ${globalContext}
      Motivational States: Curiosity=${state.motivation.curiosity}, Urgency=${state.motivation.urgency}, Focus=${state.motivation.focus}
      Active Plan Status: ${this.orchestrator.getStatus().hasActivePlan ? 'Has active plan' : 'No active plan'}

      Respond with a JSON object: { "intent": "string", "reasoning": "string" }
      Possible intents: continue_execution, explore_knowledge, consolidate_memory, idle, create_new_plan
    `;

    const reasoningResponse = await this.modelService.fastReasoning(prompt);
    
    let reasoningResult;
    try {
      // Attempt to parse JSON from response
      const jsonMatch = reasoningResponse.match(/\{.*\}/s);
      reasoningResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: 'idle', reasoning: reasoningResponse };
    } catch (e) {
      reasoningResult = { intent: 'idle', reasoning: 'Failed to parse reasoning response' };
    }

    return { 
      intent: reasoningResult.intent, 
      contextSummary: globalContext,
      reasoning: reasoningResult.reasoning
    };
  }

  private async plan(reasoning: any) {
    this.logger.info('Stage 3: Planning');
    
    if (reasoning.intent === 'continue_execution') return 'execute';
    if (reasoning.intent === 'consolidate_memory') return 'sleep';
    
    if (reasoning.intent === 'create_new_plan' || reasoning.intent === 'explore_knowledge') {
      const state = this.state.getState();
      const prompt = `
        Create a detailed plan for the following goal/intent: ${reasoning.intent}.
        Reasoning behind this intent: ${reasoning.reasoning}
        Current State: ${JSON.stringify(state.identity)}
        
        Decompose this into a series of tasks that can be executed by the agent.
      `;
      
      const planResponse = await this.modelService.deepReasoning(prompt, reasoning.contextSummary);
      this.logger.info(`Planning result: ${planResponse.substring(0, 100)}...`);
      
      // In a full implementation, we'd parse this into the Orchestrator
      return 'execute';
    }
    
    return 'wait';
  }

  private async execute() {
    this.logger.info('Stage 4: Execution');
    await this.orchestrator.runStep();
  }

  private async sleepCycle() {
    this.logger.info('Starting Sleep Cycle (Memory Consolidation)');
    this.loopState.status = 'sleeping';
    
    const summary = await this.modelService.fastReasoning("Analyze recent experiences and extract key semantic facts for long-term storage.");
    this.logger.info(`Sleep consolidation analysis: ${summary.substring(0, 50)}...`);
    
    // Pruning episodic, extracting facts to semantic
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.loopState.status = 'active';
  }

  private async reflect(cycleId: string, reasoning: any) {
    this.logger.info('Stage 5: Reflection');
    const status = this.orchestrator.getStatus();
    
    const experience = `Cycle ${cycleId}: Intent was ${reasoning.intent}. Reasoning: ${reasoning.reasoning}. Plan active: ${status.hasActivePlan}`;
    
    // Use model service to summarize reflection
    const reflectionSummary = await this.modelService.fastReasoning(`Reflect on this experience: ${experience}`);
    
    await this.memory.episodic.record(experience, { 
      cycleId, 
      intent: reasoning.intent, 
      reflection: reflectionSummary 
    });
    
    // Identity consolidation check
    if (Math.random() > 0.95) {
      this.logger.info('Self-Reflection: Aligning with base directive');
    }
  }

  async handleUserMessage(message: string): Promise<{ text: string; reasoning: string }> {
    this.logger.info(`Handling user message: ${message}`);
    
    // Add to working memory/episodic memory
    await this.memory.episodic.record(`User message: ${message}`, { type: 'user_message' });
    
    // Use ModelService to generate a response
    const state = this.state.getState();
    const context = await this.memory.globalRecall(message);
    
    const prompt = `
      User message: ${message}
      Current State: ${JSON.stringify(state.identity)}
      Context: ${context}
      
      Respond to the user as CortexForge. 
      Provide your response in JSON format: { "text": "string", "reasoning": "string" }
    `;
    
    const response = await this.modelService.fastReasoning(prompt);
    
    try {
      const jsonMatch = response.match(/\{.*\}/s);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { text: response, reasoning: 'Direct response' };
    } catch (e) {
      return { text: response, reasoning: 'Failed to parse JSON response' };
    }
  }

  getStatus() {
    return {
      ...this.loopState,
      isRunning: this.isRunning,
      subsystems: {
        orchestrator: this.orchestrator.getStatus(),
        memory: this.memory.getStatus(),
        state: this.state.getStatus()
      }
    };
  }
}
