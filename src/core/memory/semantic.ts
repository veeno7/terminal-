import Database from 'better-sqlite3';
import { DB_PATHS } from '../../shared/constants.js';
import { MemoryEntry } from '../../shared/types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class SemanticMemory {
  private db: any;

  constructor() {
    this.db = new Database(DB_PATHS.SEMANTIC);
  }

  async initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS facts (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata TEXT,
        importance REAL DEFAULT 1.0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async storeFact(content: string, importance: number = 1.0, metadata: any = {}) {
    const id = uuidv4();
    const stmt = this.db.prepare('INSERT INTO facts (id, content, importance, metadata) VALUES (?, ?, ?, ?)');
    stmt.run(id, content, importance, JSON.stringify(metadata));
  }

  async search(query: string, limit: number = 5): Promise<MemoryEntry[]> {
    const rows = this.db.prepare('SELECT * FROM facts WHERE content LIKE ? ORDER BY importance DESC, timestamp DESC LIMIT ?')
      .all(`%${query}%`, limit);
    
    return rows.map((r: any) => ({
      id: r.id,
      type: 'semantic',
      content: r.content,
      metadata: JSON.parse(r.metadata || '{}'),
      timestamp: new Date(r.timestamp)
    }));
  }

  getStatus() {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM facts').get() as { count: number };
    return {
      count: count.count
    };
  }
}
