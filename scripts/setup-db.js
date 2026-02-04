const { Pool } = require('pg');

// Direct connection string from user request for this script only
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createTableQuery = `
CREATE SCHEMA IF NOT EXISTS bible_assistant;



-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION bible_assistant.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS bible_assistant.users (
  id SERIAL PRIMARY KEY,
  cognito_sub VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON bible_assistant.users
    FOR EACH ROW
    EXECUTE FUNCTION bible_assistant.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_users_cognito_sub ON bible_assistant.users(cognito_sub);

CREATE TABLE IF NOT EXISTS bible_assistant.transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES bible_assistant.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  credits INTEGER NOT NULL,
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON bible_assistant.transactions
    FOR EACH ROW
    EXECUTE FUNCTION bible_assistant.update_updated_at_column();

CREATE TABLE IF NOT EXISTS bible_assistant.search_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_translations_updated_at
    BEFORE UPDATE ON bible_assistant.translations
    FOR EACH ROW
    EXECUTE FUNCTION bible_assistant.update_updated_at_column();

ALTER TABLE bible_assistant.transactions
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'succeeded' NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_search_history_lookup 
  ON bible_assistant.search_history (query, language, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_history_settings 
  ON bible_assistant.search_history USING GIN (settings);

DROP INDEX IF EXISTS bible_assistant.idx_search_history_user_id;

CREATE INDEX IF NOT EXISTS idx_search_history_user_recent 
  ON bible_assistant.search_history (user_id, created_at DESC);

-- 4. Optimize Transactions Retrieval
CREATE INDEX IF NOT EXISTS idx_transactions_user_recent 
  ON bible_assistant.transactions (user_id, created_at DESC);

-- 5. Ensure Fast Stripe Session Lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_stripe_session 
  ON bible_assistant.transactions (stripe_session_id);

CREATE TABLE IF NOT EXISTS bible_assistant.searches (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  settings JSONB,
  response TEXT,
  bible_results TEXT,
  commentary_results TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_search_content UNIQUE (query, language, settings)
);

CREATE TRIGGER update_searches_updated_at
    BEFORE UPDATE ON bible_assistant.searches
    FOR EACH ROW
    EXECUTE FUNCTION bible_assistant.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_searches_lookup ON bible_assistant.searches (query, language);
CREATE INDEX IF NOT EXISTS idx_searches_settings ON bible_assistant.searches USING GIN (settings);

CREATE TABLE IF NOT EXISTS bible_assistant.user_searches (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  search_id INTEGER REFERENCES bible_assistant.searches(id) ON DELETE CASCADE,
  thumbs_up BOOLEAN DEFAULT FALSE,
  thumbs_down BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_user_searches_updated_at
    BEFORE UPDATE ON bible_assistant.user_searches
    FOR EACH ROW
    EXECUTE FUNCTION bible_assistant.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON bible_assistant.user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_search_id ON bible_assistant.user_searches(search_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created_at ON bible_assistant.user_searches(created_at DESC);

-- Insert unique searches first (migration logic)
INSERT INTO bible_assistant.searches (query, language, settings, response, bible_results, commentary_results, created_at, updated_at)
SELECT DISTINCT ON (query, language, settings) 
  query, 
  COALESCE(language, 'en'), 
  settings, 
  response, 
  bible_results, 
  commentary_results, 
  created_at,
  created_at as updated_at
FROM bible_assistant.search_history
ON CONFLICT (query, language, settings) DO NOTHING;

INSERT INTO bible_assistant.user_searches (user_id, search_id, created_at, thumbs_up, thumbs_down, updated_at)
SELECT 
  sh.user_id, 
  s.id, 
  sh.created_at, 
  CASE WHEN COALESCE(sh.thumbs_up, 0) > 0 THEN TRUE ELSE FALSE END,
  CASE WHEN COALESCE(sh.thumbs_down, 0) > 0 THEN TRUE ELSE FALSE END,
  sh.created_at as updated_at
FROM bible_assistant.search_history sh
JOIN bible_assistant.searches s 
  ON sh.query = s.query 
  AND COALESCE(sh.language, 'en') = s.language 
  AND (sh.settings IS NOT DISTINCT FROM s.settings)
WHERE NOT EXISTS (
  SELECT 1 FROM bible_assistant.user_searches us 
  WHERE us.user_id = sh.user_id AND us.search_id = s.id AND us.created_at = sh.created_at
);

DROP TABLE bible_assistant.search_history;

ALTER TABLE bible_assistant.searches
  DROP CONSTRAINT IF EXISTS unique_search_content;

CREATE TABLE IF NOT EXISTS bible_assistant.media_cache (
  query TEXT NOT NULL,
  lang VARCHAR(10) NOT NULL DEFAULT 'en',
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (query, lang)
);

CREATE TRIGGER update_media_cache_updated_at
    BEFORE UPDATE ON bible_assistant.media_cache
    FOR EACH ROW
    EXECUTE FUNCTION bible_assistant.update_updated_at_column();

ALTER TABLE bible_assistant.users 
ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS bible_assistant.user_daily_usage (
    user_id TEXT NOT NULL,
    day DATE NOT NULL DEFAULT CURRENT_DATE,
    media_search_count INTEGER DEFAULT 0,
    general_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, day)
);

CREATE TRIGGER update_user_daily_usage_updated_at
    BEFORE UPDATE ON bible_assistant.user_daily_usage
    FOR EACH ROW
    EXECUTE FUNCTION bible_assistant.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_daily_usage_day ON bible_assistant.user_daily_usage(day);
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
