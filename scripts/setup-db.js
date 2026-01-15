const { Pool } = require('pg');

// Direct connection string from user request for this script only
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTableQuery = `
  CREATE SCHEMA IF NOT EXISTS bible_assistant;

  CREATE TABLE IF NOT EXISTS bible_assistant.users (
    id SERIAL PRIMARY KEY,
    cognito_sub VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_users_cognito_sub ON bible_assistant.users(cognito_sub);

  CREATE TABLE IF NOT EXISTS bible_assistant.transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES bible_assistant.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    credits INTEGER NOT NULL,
    stripe_session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bible_assistant.search_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON bible_assistant.search_history(user_id);

  ALTER TABLE bible_assistant.search_history 
  ADD COLUMN IF NOT EXISTS bible_results TEXT,
  ADD COLUMN IF NOT EXISTS commentary_results TEXT,
  ADD COLUMN IF NOT EXISTS language VARCHAR(10),
  ADD COLUMN IF NOT EXISTS settings JSONB,
  ADD COLUMN IF NOT EXISTS thumbs_up INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thumbs_down INTEGER DEFAULT 0;

  CREATE TABLE IF NOT EXISTS bible_assistant.translations (
    hash TEXT PRIMARY KEY,
    original_text TEXT NOT NULL,
    translated_text TEXT,
    language TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE bible_assistant.transactions
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'succeeded' NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

  -- 1. Optimize Search Lookup
CREATE INDEX IF NOT EXISTS idx_search_history_lookup 
ON bible_assistant.search_history (query, language, created_at DESC);

-- 2. Optimize JSONB Settings Query
CREATE INDEX IF NOT EXISTS idx_search_history_settings 
ON bible_assistant.search_history USING GIN (settings);

-- 3. Optimize User History Retrieval (Composite Index)
DROP INDEX IF EXISTS bible_assistant.idx_search_history_user_id;
CREATE INDEX IF NOT EXISTS idx_search_history_user_recent 
ON bible_assistant.search_history (user_id, created_at DESC);

-- 4. Optimize Transactions Retrieval
CREATE INDEX IF NOT EXISTS idx_transactions_user_recent 
ON bible_assistant.transactions (user_id, created_at DESC);

-- 5. Ensure Fast Stripe Session Lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_stripe_session 
ON bible_assistant.transactions (stripe_session_id);
`;

async function setup() {
  try {
    const client = await pool.connect();
    console.log('Connected to database...');
    
    await client.query(createTableQuery);
    console.log('Schema and table created successfully.');
    
    client.release();
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
  }
}

setup();
