import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
const db = new Database(process.env.DATABASE_FILE || process.env.DB_PATH || 'crownvotes.sqlite');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'voter', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'draft', starts_at TEXT, ends_at TEXT, vote_price INTEGER NOT NULL DEFAULT 100, currency TEXT NOT NULL DEFAULT 'GHS', prize_structure TEXT NOT NULL DEFAULT 'mixed', payment_approval TEXT NOT NULL DEFAULT 'pending', approval_note TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY, event_id INTEGER NOT NULL REFERENCES events(id), name TEXT NOT NULL, description TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS nominees(id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES categories(id), name TEXT NOT NULL, bio TEXT DEFAULT '', image_url TEXT DEFAULT '', vote_count INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS payments(id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), reference TEXT UNIQUE NOT NULL, provider TEXT NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', metadata TEXT DEFAULT '{}', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS votes(id INTEGER PRIMARY KEY, payment_id INTEGER REFERENCES payments(id), user_id INTEGER REFERENCES users(id), nominee_id INTEGER NOT NULL REFERENCES nominees(id), quantity INTEGER NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS organiser_applications(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), organisation TEXT NOT NULL, phone TEXT NOT NULL, details TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'pending', admin_note TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id));
CREATE TABLE IF NOT EXISTS payouts(id INTEGER PRIMARY KEY, organiser_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'GHS', destination TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'requested', reference TEXT UNIQUE NOT NULL, admin_note TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, processed_at TEXT);
CREATE TABLE IF NOT EXISTS platform_settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY, actor_id INTEGER REFERENCES users(id), action TEXT NOT NULL, target_type TEXT NOT NULL, target_id TEXT NOT NULL, details TEXT DEFAULT '{}', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
function addColumn(table, column, definition) { const cols=db.prepare(`PRAGMA table_info(${table})`).all().map(c=>c.name); if(!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`); }
addColumn('events','owner_id','INTEGER REFERENCES users(id)');
addColumn('events','commission_bps','INTEGER NOT NULL DEFAULT 1000');
addColumn('payments','platform_fee','INTEGER NOT NULL DEFAULT 0');
addColumn('payments','organiser_net','INTEGER NOT NULL DEFAULT 0');
addColumn('payments','settled_at','TEXT');
addColumn('payments','provider_fee','INTEGER NOT NULL DEFAULT 0');
addColumn('payments','event_id','INTEGER REFERENCES events(id)');
addColumn('payments','nominee_id','INTEGER REFERENCES nominees(id)');
addColumn('payments','quantity','INTEGER NOT NULL DEFAULT 0');
addColumn('payments','phone','TEXT DEFAULT \'\'');
addColumn('payments','network','TEXT DEFAULT \'\'');
const initialCommission=Math.max(0,Math.min(3000,Math.round(Number(process.env.DEFAULT_COMMISSION_PERCENT||10)*100)));
for (const [k,v] of [['default_commission_bps',String(initialCommission)],['platform_name','CrownVotes']]) db.prepare('INSERT OR IGNORE INTO platform_settings(key,value) VALUES(?,?)').run(k,v);
// Bootstrap an administrator only when explicit credentials are supplied in the deployment environment.
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  const email=process.env.ADMIN_EMAIL.toLowerCase();
  if(!db.prepare('SELECT id FROM users WHERE email=?').get(email)) db.prepare('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)').run('CrownVotes Admin',email,bcrypt.hashSync(process.env.ADMIN_PASSWORD,12),'admin');
}
export default db;
