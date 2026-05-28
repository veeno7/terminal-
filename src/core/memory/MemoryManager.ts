import { WorkingMemory } from './working.js';
import { EpisodicMemory } from './episodic.js';
import { SemanticMemory } from './semantic.js';
import { ProceduralMemory } from './procedural.js';

export class MemoryManager {
  public working: WorkingMemory;
  public episodic: EpisodicMemory;
  public semantic: SemanticMemory;
  public procedural: ProceduralMemory;

  constructor() {
    this.working = new WorkingMemory();
    this.episodic = new EpisodicMemory();
    this.semantic = new SemanticMemory();
    this.procedural = new ProceduralMemory();
  }

  async initialize() {
    await this.working.initialize();
    await this.episodic.initialize();
    await this.semantic.initialize();
    await this.procedural.initialize();
  }

  async globalRecall(query: string): Promise<string> {
    const episodicMatches = await this.episodic.search(query);
    const semanticMatches = await this.semantic.search(query);
    
    return `
RELEVANT PAST EXPERIENCES:
${episodicMatches.map(m => `- ${m.content}`).join('\n')}

RELEVANT FACTS:
${semanticMatches.map(m => `- ${m.content}`).join('\n')}
    `.trim();
  }

  getStatus() {
    return {
      working: this.working.getStatus(),
      episodic: this.episodic.getStatus(),
      semantic: this.semantic.getStatus(),
      procedural: this.procedural.getStatus(),
    };
  }
}
