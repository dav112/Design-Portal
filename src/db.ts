import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('design_requests.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migration: Add missing columns to requests table if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(requests)").all() as any[];
const columns = tableInfo.map(c => c.name);

const missingColumns = [
  { name: 'media', type: 'TEXT' },
  { name: 'file_format', type: 'TEXT' },
  { name: 'print_media_type', type: 'TEXT' },
  { name: 'size', type: 'TEXT' },
  { name: 'finishing', type: 'TEXT' },
  { name: 'is_urgent', type: 'INTEGER DEFAULT 0' }
];

missingColumns.forEach(col => {
  if (!columns.includes(col.name)) {
    db.exec(`ALTER TABLE requests ADD COLUMN ${col.name} ${col.type}`);
  }
});

// Seed default settings if not exists
const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
insertSetting.run('telegram_bot_token', '8176258662:AAF0meeeM7XVU88__nP3YkPs3tKCQ26Eb18');
insertSetting.run('telegram_chat_id', '1341641647');

export default db;
