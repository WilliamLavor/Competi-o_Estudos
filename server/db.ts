import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'studytimer.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Nunca edite uma migration já aplicada: acrescente uma nova no fim do array.
const migrations: string[] = [
  `CREATE TABLE sessions (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     subject TEXT NOT NULL,
     duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
     notes TEXT,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
];

export function migrate() {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (let v = current; v < migrations.length; v++) {
    db.transaction(() => {
      db.exec(migrations[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}