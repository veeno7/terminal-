import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Skill } from '../../shared/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SkillRegistry {
  private skills: Map<string, Skill> = new Map();

  async initialize() {
    // Determine if we are running from src or dist
    const isCompiled = __dirname.includes(`${path.sep}dist${path.sep}`);
    const skillsBaseDir = isCompiled ? 'dist' : 'src';
    const skillsPath = path.resolve(process.cwd(), skillsBaseDir, 'skills');

    if (!fs.existsSync(skillsPath)) {
      console.warn(`[SkillRegistry] Skills path not found: ${skillsPath}`);
      return;
    }

    await this.scanSkills(skillsPath, isCompiled ? '.js' : '.ts');
    console.log(`[SkillRegistry] Initialized with ${this.skills.size} skills from ${skillsPath}`);
  }

  private async scanSkills(dir: string, extension: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const manifestPath = path.join(fullPath, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            const indexPath = path.join(fullPath, `index${extension}`);
            
            this.skills.set(manifest.name, {
              ...manifest,
              path: indexPath
            });
          } catch (error) {
            console.error(`[SkillRegistry] Error loading skill at ${fullPath}:`, error);
          }
        } else {
          await this.scanSkills(fullPath, extension);
        }
      }
    }
  }

  getSkill(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getStatus() {
    return {
      count: this.skills.size,
      skills: Array.from(this.skills.keys())
    };
  }
}
