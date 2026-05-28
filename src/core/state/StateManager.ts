import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { InternalState } from '../../shared/types/index.js';
import { DB_PATHS } from '../../shared/constants.js';

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export class StateManager {
  private db: ReturnType<typeof Database>;
  private state: InternalState | null = null;

  constructor() {
    ensureDir(DB_PATHS.STATE);
    this.db = new Database(DB_PATHS.STATE);
  }

  async initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS state (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const row = this.db.prepare('SELECT data FROM state WHERE id = ?').get('current') as { data: string } | undefined;
    if (row) {
      this.state = JSON.parse(row.data) as InternalState;
    } else {
      this.state = this.getDefaultState();
      await this.saveState();
    }
  }

  private getDefaultState(): InternalState {
    return {
      identity: {
        name: 'CortexForge',
        persona: 'Professional and efficient autonomous agent',
        baseDirective: 'Assist the user by executing complex tasks autonomously.',
        constraints: ['Never delete user files without confirmation', 'Stay within token limits']
      },
      motivation: {
        curiosity: 0.5,
        urgency: 0.5,
        focus: 0.8
      },
      vitals: {
        tokenUsage: 0,
        tokenLimit: 1000000,
        apiHealth: {},
        computeLoad: 0
      },
      preferences: {}
    };
  }

  async saveState() {
    if (!this.state) return;
    const stmt = this.db.prepare('INSERT OR REPLACE INTO state (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    stmt.run('current', JSON.stringify(this.state));
  }

  getState(): InternalState {
    if (!this.state) throw new Error('State not initialized');
    return this.state;
  }

  async updateState(updater: (state: InternalState) => void) {
    if (!this.state) throw new Error('State not initialized');
    updater(this.state);
    await this.saveState();
  }

  async setVitals(vitals: Partial<InternalState['vitals']>) {
    await this.updateState(s => {
      s.vitals = { ...s.vitals, ...vitals };
    });
  }

  getStatus() {
    return {
      initialized: !!this.state,
      state: this.state
    };
  }
}
