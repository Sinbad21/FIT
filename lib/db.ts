import Database from 'better-sqlite3'; import fs from 'node:fs'; import path from 'node:path'; import { randomUUID } from 'node:crypto';
const dbPath=process.env.FITCONTROL_DB_PATH||path.join(process.cwd(),'data','fitcontrol.sqlite'); let instance:Database.Database|null=null;
export function dbReady(){return fs.existsSync(dbPath)}
export function getDb(){if(!dbReady()) throw new Error('Database non inizializzato. Esegui npm run setup:db'); if(!instance){instance=new Database(dbPath);instance.pragma('foreign_keys=ON');migrate(instance)} return instance}

// Idempotent migrations: keep an existing DB in sync without a full reset.
function migrate(db: Database.Database){
  db.exec(`CREATE TABLE IF NOT EXISTS push_subscriptions(id TEXT PRIMARY KEY,endpoint TEXT NOT NULL UNIQUE,p256dh TEXT NOT NULL,auth TEXT NOT NULL,user_agent TEXT,enabled INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
  // notifications.last_sent_at: lets the scheduler avoid duplicate sends per day.
  const cols: any[] = db.prepare("PRAGMA table_info(notifications)").all();
  if(!cols.find((c)=>c.name==='last_sent_at')) db.exec("ALTER TABLE notifications ADD COLUMN last_sent_at TEXT");
  // Backfill onboarding flag once: a profile that was edited after creation was already set up
  // manually, so it shouldn't be interrupted by the wizard on the next app open.
  const hasFlag = db.prepare("select 1 from app_settings where key='onboarding_completed'").get();
  if(!hasFlag){
    const prof: any = db.prepare('select created_at, updated_at from user_profile order by created_at limit 1').get();
    const done = prof ? prof.updated_at !== prof.created_at : false;
    db.prepare('insert into app_settings (id,key,value) values (?,?,?)').run(randomUUID(), 'onboarding_completed', done ? '1' : '0');
  }
}
