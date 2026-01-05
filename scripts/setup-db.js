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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
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
