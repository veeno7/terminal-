import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { DB_PATHS } from '../../shared/constants.js';
import { MemoryEntry } from '../../shared/types/index.js';
import { v4 as uuidv4 } from 'uuid';

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export class EpisodicMemory {
  private db: ReturnType<typeof Database>;

  constructor() {
    ensureDir(DB_PATHS.EPISODIC);
    this.db = new Database(DB_PATHS.EPISODIC);
  }

  async initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS episodes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async record(content: string, metadata: Record<string, unknown> = {}) {
    const id = uuidv4();
    const stmt = this.db.prepare('INSERT INTO episodes (id, content, metadata) VALUES (?, ?, ?)');
    stmt.run(id, content, JSON.stringify(metadata));
  }

  async search(query: string, limit: number = 5): Promise<MemoryEntry[]> {
    const rows = this.db.prepare('SELECT * FROM episodes WHERE content LIKE ? ORDER BY timestamp DESC LIMIT ?')
      .all(`%${query}%`, limit) as Array<{ id: string; content: string; metadata: string; timestamp: string }>;

    return rows.map((r) => ({
      id: r.id,
      content: r.content,
      metadata: JSON.parse(r.metadata || '{}') as Record<string, unknown>,
      timestamp: new Date(r.timestamp)
    }));
  }

  getStatus() {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM episodes').get() as { count: number };
    return { count: count.count };
  }
}
