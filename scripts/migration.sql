-- 1. Create new tables for refactored history
CREATE TABLE IF NOT EXISTS bible_assistant.searches (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    settings JSONB,
    response TEXT,
    bible_results TEXT,
    commentary_results TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_search_content UNIQUE (query, language, settings)
);

CREATE INDEX IF NOT EXISTS idx_searches_lookup ON bible_assistant.searches (query, language);
CREATE INDEX IF NOT EXISTS idx_searches_settings ON bible_assistant.searches USING GIN (settings);

CREATE TABLE IF NOT EXISTS bible_assistant.user_searches (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    search_id INTEGER REFERENCES bible_assistant.searches(id) ON DELETE CASCADE,
    thumbs_up BOOLEAN DEFAULT FALSE,
    thumbs_down BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON bible_assistant.user_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_search_id ON bible_assistant.user_searches(search_id);
CREATE INDEX IF NOT EXISTS idx_user_searches_created_at ON bible_assistant.user_searches(created_at DESC);

-- 2. Migrate existing data from search_history to new tables

-- Insert unique searches first
INSERT INTO bible_assistant.searches (query, language, settings, response, bible_results, commentary_results, created_at)
SELECT DISTINCT ON (query, language, settings) 
    query, 
    COALESCE(language, 'en'), 
    settings, 
    response, 
    bible_results, 
    commentary_results, 
    created_at
FROM bible_assistant.search_history
ON CONFLICT (query, language, settings) DO NOTHING;

-- Link users to searches (creating history entries)
INSERT INTO bible_assistant.user_searches (user_id, search_id, created_at, thumbs_up, thumbs_down)
SELECT 
    sh.user_id, 
    s.id, 
    sh.created_at, 
    CASE WHEN COALESCE(sh.thumbs_up, 0) > 0 THEN TRUE ELSE FALSE END,
    CASE WHEN COALESCE(sh.thumbs_down, 0) > 0 THEN TRUE ELSE FALSE END
FROM bible_assistant.search_history sh
JOIN bible_assistant.searches s 
    ON sh.query = s.query 
    AND COALESCE(sh.language, 'en') = s.language 
    AND (sh.settings IS NOT DISTINCT FROM s.settings)
WHERE NOT EXISTS (
    SELECT 1 FROM bible_assistant.user_searches us 
    WHERE us.user_id = sh.user_id AND us.search_id = s.id AND us.created_at = sh.created_at
);

-- Note: We are NOT dropping the old table yet to ensure safety.
-- Once verified, you can run: DROP TABLE bible_assistant.search_history;
