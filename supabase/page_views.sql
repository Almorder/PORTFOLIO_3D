-- Page View Counter — Supabase setup
-- Run this in Supabase SQL Editor, then set SUPABASE_URL and SUPABASE_ANON_KEY.
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  views INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON page_views;
DROP POLICY IF EXISTS "Allow public insert access" ON page_views;
DROP POLICY IF EXISTS "Allow public update access" ON page_views;

CREATE POLICY "Allow public read access"
ON page_views FOR SELECT USING (true);

CREATE POLICY "Allow public insert access"
ON page_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access"
ON page_views FOR UPDATE USING (true);
