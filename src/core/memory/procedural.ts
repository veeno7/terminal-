import fs from 'fs';
import path from 'path';

export class ProceduralMemory {
  private experiences: any[] = [];
  private readonly filePath = 'data/db/procedural.json';

  async initialize() {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      this.experiences = JSON.parse(data);
    }
  }

  async recordSkillSuccess(skillName: string, parameters: any, outcome: any) {
    this.experiences.push({
      skillName,
      parameters,
      outcome,
      status: 'success',
      timestamp: new Date()
    });
    this.save();
  }

  async recordSkillFailure(skillName: string, parameters: any, error: string) {
    this.experiences.push({
      skillName,
      parameters,
      error,
      status: 'failure',
      timestamp: new Date()
    });
    this.save();
  }

  private save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.experiences, null, 2));
  }

  getBestPractices(skillName: string) {
    return this.experiences
      .filter(e => e.skillName === skillName && e.status === 'success')
      .slice(-3);
  }

  getStatus() {
    return {
      count: this.experiences.length
    };
  }
}
