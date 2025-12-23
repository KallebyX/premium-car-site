-- ============================================
-- Migration: Create carros_avaliados table
-- Description: Main table for car reviews
-- ============================================

CREATE TABLE IF NOT EXISTS carros_avaliados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  preco_estimado NUMERIC NOT NULL,
  nota_geral INTEGER NOT NULL CHECK (nota_geral >= 1 AND nota_geral <= 10),
  video_url TEXT,
  imagem_url TEXT,
  autor_email TEXT,
  data_postagem TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_carros_data ON carros_avaliados(data_postagem DESC);
CREATE INDEX IF NOT EXISTS idx_carros_marca ON carros_avaliados(marca);
CREATE INDEX IF NOT EXISTS idx_carros_ano ON carros_avaliados(ano);
CREATE INDEX IF NOT EXISTS idx_carros_preco ON carros_avaliados(preco_estimado);
CREATE INDEX IF NOT EXISTS idx_carros_nota ON carros_avaliados(nota_geral);

-- Enable Row Level Security
ALTER TABLE carros_avaliados ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
DROP POLICY IF EXISTS "Permitir leitura publica de carros" ON carros_avaliados;
CREATE POLICY "Permitir leitura publica de carros" ON carros_avaliados
  FOR SELECT USING (true);

-- Policy: Authenticated insert
DROP POLICY IF EXISTS "Permitir insercao autenticada de carros" ON carros_avaliados;
CREATE POLICY "Permitir insercao autenticada de carros" ON carros_avaliados
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated update
DROP POLICY IF EXISTS "Permitir atualizacao autenticada de carros" ON carros_avaliados;
CREATE POLICY "Permitir atualizacao autenticada de carros" ON carros_avaliados
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated delete
DROP POLICY IF EXISTS "Permitir delecao autenticada de carros" ON carros_avaliados;
CREATE POLICY "Permitir delecao autenticada de carros" ON carros_avaliados
  FOR DELETE USING (auth.role() = 'authenticated');
