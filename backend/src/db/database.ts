import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Connection pool — handles concurrent requests properly.
// max: 10 connections is a safe default for a single backend instance.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL is only needed when connecting to managed cloud providers (Render, Supabase etc.)
  // that explicitly require it. The internal Docker postgres does not use SSL.
  // Set DB_SSL_REJECT_UNAUTHORIZED=false only when the provider uses a non-standard CA
  // (e.g. Render free tier). Never disable this in a real production deployment.
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

const BRANCHES = [
  { id: '1', name: 'Cape Town City Centre Branch', address: '1 Adderley Street, Cape Town City Centre', phone: '(021) 001-1000' },
  { id: '2', name: 'Sea Point Branch',             address: '145 Main Road, Sea Point, Cape Town',       phone: '(021) 002-2000' },
  { id: '3', name: 'Claremont Branch',             address: '32 Vineyard Road, Claremont, Cape Town',    phone: '(021) 003-3000' },
  { id: '4', name: 'Tyger Valley Branch',          address: 'Willie van Schoor Ave, Bellville',          phone: '(021) 004-4000' },
] as const;

// Called once at server startup: creates schema + seeds branches.
export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS branches (
      id      TEXT PRIMARY KEY,
      name    TEXT NOT NULL,
      address TEXT NOT NULL,
      phone   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id             TEXT PRIMARY KEY,
      branch_id      TEXT NOT NULL REFERENCES branches(id),
      date           DATE NOT NULL,
      time_slot      TEXT NOT NULL,
      customer_name  TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL DEFAULT '',
      status         TEXT NOT NULL DEFAULT 'confirmed',
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      -- Prevents double-booking at the database level, even under concurrent requests
      UNIQUE (branch_id, date, time_slot)
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_branch_date
      ON bookings (branch_id, date);
  `);

  // Upsert branches — keeps names/addresses current on every restart
  for (const b of BRANCHES) {
    await pool.query(
      `INSERT INTO branches (id, name, address, phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
         SET name    = EXCLUDED.name,
             address = EXCLUDED.address,
             phone   = EXCLUDED.phone`,
      [b.id, b.name, b.address, b.phone],
    );
  }

  console.log('  Branches synced (Cape Town).');
}

export default pool;
