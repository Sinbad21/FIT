import Database from 'better-sqlite3'; import fs from 'node:fs'; import path from 'node:path';
const dbPath=process.env.FITCONTROL_DB_PATH||path.join(process.cwd(),'data','fitcontrol.sqlite'); let instance:Database.Database|null=null;
export function dbReady(){return fs.existsSync(dbPath)}
export function getDb(){if(!dbReady()) throw new Error('Database non inizializzato. Esegui npm run setup:db'); if(!instance){instance=new Database(dbPath);instance.pragma('foreign_keys=ON');migrate(instance)} return instance}

// Idempotent migrations: keep an existing DB in sync without a full reset.
function migrate(db: Database.Database){
  db.exec(`CREATE TABLE IF NOT EXISTS push_subscriptions(id TEXT PRIMARY KEY,endpoint TEXT NOT NULL UNIQUE,p256dh TEXT NOT NULL,auth TEXT NOT NULL,user_agent TEXT,enabled INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
  // notifications.last_sent_at: lets the scheduler avoid duplicate sends per day.
  const cols: any[] = db.prepare("PRAGMA table_info(notifications)").all();
  if(!cols.find((c)=>c.name==='last_sent_at')) db.exec("ALTER TABLE notifications ADD COLUMN last_sent_at TEXT");
}
