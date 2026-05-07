import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// In Docker the DB_DIR env var is set to a mounted volume (/data).
// In local dev it defaults to a 'data' directory inside the backend folder.
const DB_DIR  = process.env.DB_DIR ?? path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'appointments.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// WAL mode: allows concurrent reads while a write is in progress
db.exec('PRAGMA journal_mode = WAL');
// Enforce foreign-key constraints
db.exec('PRAGMA foreign_keys = ON');

// Schema 
db.exec(`
  CREATE TABLE IF NOT EXISTS branches (
    id      TEXT PRIMARY KEY,
    name    TEXT NOT NULL,
    address TEXT NOT NULL,
    phone   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id             TEXT PRIMARY KEY,
    branch_id      TEXT NOT NULL REFERENCES branches(id),
    date           TEXT NOT NULL,
    time_slot      TEXT NOT NULL,
    customer_name  TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL DEFAULT '',
    status         TEXT NOT NULL DEFAULT 'confirmed',
    created_at     TEXT NOT NULL,
    -- Database-level unique constraint prevents double-booking
    -- even under concurrent requests
    UNIQUE (branch_id, date, time_slot)
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_branch_date
    ON bookings (branch_id, date);
`);

// Upsert branches (runs on every startup to keep names current) 
const upsert = db.prepare(
  'INSERT OR REPLACE INTO branches (id, name, address, phone) VALUES ($id, $name, $address, $phone)',
);

db.exec('BEGIN');
try {
  upsert.run({ id: '1', name: 'Cape Town City Centre Branch', address: '1 Adderley Street, Cape Town City Centre', phone: '(021) 001-1000' });
  upsert.run({ id: '2', name: 'Sea Point Branch',             address: '145 Main Road, Sea Point, Cape Town',       phone: '(021) 002-2000' });
  upsert.run({ id: '3', name: 'Claremont Branch',             address: '32 Vineyard Road, Claremont, Cape Town',    phone: '(021) 003-3000' });
  upsert.run({ id: '4', name: 'Tyger Valley Branch',          address: 'Willie van Schoor Ave, Bellville',          phone: '(021) 004-4000' });
  db.exec('COMMIT');
  console.log('🌱  Branches synced (Cape Town).');
} catch (err) {
  db.exec('ROLLBACK');
  throw err;
}

console.log(`SQLite database → ${DB_PATH}`);

export default db;
