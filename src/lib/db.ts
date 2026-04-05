import { Pool, PoolConfig } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Warn only in production, or handle as you see fit.
  // In dev we might not have it set up immediately.
  console.warn('DATABASE_URL is not defined');
}

const config: PoolConfig = {
  connectionString,
};

// Enable SSL if running in production (except for localhost), or if explicitly required
if (
  process.env.DB_REQUIRE_SSL === 'true' ||
  connectionString?.includes('sslmode=require') ||
  (process.env.NODE_ENV === 'production' &&
    process.env.DB_REQUIRE_SSL !== 'false' &&
    connectionString &&
    !connectionString.includes('localhost') &&
    !connectionString.includes('127.0.0.1'))
) {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

// Explicitly remove SSL if disabled via env or connection string
if (
  process.env.DB_REQUIRE_SSL === 'false' ||
  connectionString?.includes('sslmode=disable')
) {
  delete config.ssl;
}

export const pool = new Pool(config);
