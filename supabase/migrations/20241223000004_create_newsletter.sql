-- ============================================
-- Migration: Create newsletter table
-- Description: Newsletter subscriptions
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'website'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter(is_active);

-- Enable Row Level Security
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Policy: Public insert
DROP POLICY IF EXISTS "Permitir insercao publica de newsletter" ON newsletter;
CREATE POLICY "Permitir insercao publica de newsletter" ON newsletter
  FOR INSERT WITH CHECK (true);

-- Policy: Authenticated read
DROP POLICY IF EXISTS "Permitir leitura autenticada de newsletter" ON newsletter;
CREATE POLICY "Permitir leitura autenticada de newsletter" ON newsletter
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Public update (for unsubscribe)
DROP POLICY IF EXISTS "Permitir atualizacao publica de newsletter" ON newsletter;
CREATE POLICY "Permitir atualizacao publica de newsletter" ON newsletter
  FOR UPDATE USING (true);

-- Policy: Public delete (for unsubscribe)
DROP POLICY IF EXISTS "Permitir delecao publica de newsletter" ON newsletter;
CREATE POLICY "Permitir delecao publica de newsletter" ON newsletter
  FOR DELETE USING (true);
