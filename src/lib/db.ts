import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Warn only in production, or handle as you see fit.
  // In dev we might not have it set up immediately.
  console.warn('DATABASE_URL is not defined');
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
