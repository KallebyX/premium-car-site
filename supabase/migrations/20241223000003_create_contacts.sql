-- ============================================
-- Migration: Create contacts table
-- Description: Contact form submissions
-- ============================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts(read);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Public insert
DROP POLICY IF EXISTS "Permitir insercao publica de contatos" ON contacts;
CREATE POLICY "Permitir insercao publica de contatos" ON contacts
  FOR INSERT WITH CHECK (true);

-- Policy: Authenticated read
DROP POLICY IF EXISTS "Permitir leitura autenticada de contatos" ON contacts;
CREATE POLICY "Permitir leitura autenticada de contatos" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated update
DROP POLICY IF EXISTS "Permitir atualizacao autenticada de contatos" ON contacts;
CREATE POLICY "Permitir atualizacao autenticada de contatos" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated delete
DROP POLICY IF EXISTS "Permitir delecao autenticada de contatos" ON contacts;
CREATE POLICY "Permitir delecao autenticada de contatos" ON contacts
  FOR DELETE USING (auth.role() = 'authenticated');
