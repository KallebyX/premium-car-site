-- Tabela para armazenar mensagens de contato
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

-- Índice para melhorar performance de consultas por data
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Índice para consultas por status de leitura
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts(read);

-- Habilitar Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (formulário de contato)
CREATE POLICY "Permitir inserção pública" ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir leitura apenas autenticada
CREATE POLICY "Permitir leitura autenticada" ON contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');
