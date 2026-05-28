export class WorkingMemory {
  private context: string[] = [];
  private readonly MAX_CONTEXT = 20;

  async initialize() {
    // In a real system, this might load from Redis
  }

  add(entry: string) {
    this.context.push(entry);
    if (this.context.length > this.MAX_CONTEXT) {
      this.context.shift();
    }
  }

  getContext(): string {
    return this.context.join('\n');
  }

  clear() {
    this.context = [];
  }

  getStatus() {
    return {
      size: this.context.length,
      maxSize: this.MAX_CONTEXT
    };
  }
}
