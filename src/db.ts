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

  CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  );
`);

// Seed default admin if not exists
const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count: number };
if (adminCount.count === 0) {
  db.prepare("INSERT INTO admins (username, password) VALUES (?, ?)").run('admin', 'admin123');
}

// Seed default portfolio if empty or too few items
const portoCount = db.prepare("SELECT COUNT(*) as count FROM portfolio").get() as { count: number };
console.log(`Current portfolio count: ${portoCount.count}`);
if (portoCount.count < 3) {
  console.log("Seeding default portfolio items...");
  const insertPorto = db.prepare("INSERT INTO portfolio (title, image_url, category) VALUES (?, ?, ?)");
  
  // Clear existing if any to avoid duplicates if we're below 3
  if (portoCount.count > 0 && portoCount.count < 3) {
    db.prepare("DELETE FROM portfolio").run();
  }

  insertPorto.run('Cyberpunk Branding', 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop', 'Branding');
  insertPorto.run('Neon UI Kit', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop', 'UI/UX');
  insertPorto.run('Brutal Poster', 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop', 'Print');
}

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
