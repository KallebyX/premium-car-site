-- Tabela para armazenar inscritos na newsletter
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Índice para melhorar performance de consultas por email
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);

-- Índice para consultas por data de inscrição
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter(subscribed_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (formulário de newsletter)
CREATE POLICY "Permitir inserção pública" ON newsletter
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir deleção pública (cancelar inscrição)
CREATE POLICY "Permitir deleção pública" ON newsletter
  FOR DELETE
  USING (true);

-- Política para permitir leitura apenas autenticada
CREATE POLICY "Permitir leitura autenticada" ON newsletter
  FOR SELECT
  USING (auth.role() = 'authenticated');
