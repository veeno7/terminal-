import { CognitionLoopManager } from './core/loop/CognitionLoop.js';
import { MemoryManager } from './core/memory/MemoryManager.js';
import { StateManager } from './core/state/StateManager.js';
import { Orchestrator } from './core/planner/Orchestrator.js';
import { SkillRegistry } from './core/executor/SkillRegistry.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'data/logs/system.log' })
  ],
});

export class Engine {
  public state: StateManager;
  public memory: MemoryManager;
  public registry: SkillRegistry;
  public orchestrator: Orchestrator;
  public loop: CognitionLoopManager;
  private static instance: Engine;

  private constructor() {
    this.state = new StateManager();
    this.memory = new MemoryManager();
    this.registry = new SkillRegistry();
    this.orchestrator = new Orchestrator(this.memory, this.registry);
    this.loop = new CognitionLoopManager(this.state, this.memory, this.orchestrator);
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }
    return Engine.instance;
  }

  async initialize() {
    logger.info('Initializing Engine components...');
    await this.state.initialize();
    await this.memory.initialize();
    await this.registry.initialize();
    await this.orchestrator.initialize();
    logger.info('Engine components initialized');
  }

  async start() {
    await this.loop.start();
    logger.info('Cognition loop started');
  }
}

export const engine = Engine.getInstance();
