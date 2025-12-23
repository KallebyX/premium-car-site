-- ============================================
-- PREMIUM CAR - SCHEMA COMPLETO DO BANCO
-- Execute este script no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABELA DE CARROS AVALIADOS
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_carros_data ON carros_avaliados(data_postagem DESC);
CREATE INDEX IF NOT EXISTS idx_carros_marca ON carros_avaliados(marca);
CREATE INDEX IF NOT EXISTS idx_carros_ano ON carros_avaliados(ano);
CREATE INDEX IF NOT EXISTS idx_carros_preco ON carros_avaliados(preco_estimado);
CREATE INDEX IF NOT EXISTS idx_carros_nota ON carros_avaliados(nota_geral);

-- RLS para carros
ALTER TABLE carros_avaliados ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
DROP POLICY IF EXISTS "Permitir leitura pública de carros" ON carros_avaliados;
CREATE POLICY "Permitir leitura pública de carros" ON carros_avaliados
  FOR SELECT USING (true);

-- Política para inserção autenticada
DROP POLICY IF EXISTS "Permitir inserção autenticada de carros" ON carros_avaliados;
CREATE POLICY "Permitir inserção autenticada de carros" ON carros_avaliados
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização autenticada
DROP POLICY IF EXISTS "Permitir atualização autenticada de carros" ON carros_avaliados;
CREATE POLICY "Permitir atualização autenticada de carros" ON carros_avaliados
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para deleção autenticada
DROP POLICY IF EXISTS "Permitir deleção autenticada de carros" ON carros_avaliados;
CREATE POLICY "Permitir deleção autenticada de carros" ON carros_avaliados
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 2. TABELA DE PERFIS DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- RLS para perfis
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuário ver seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON user_profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para admins verem todos os perfis
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON user_profiles;
CREATE POLICY "Admins podem ver todos os perfis" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Política para usuário atualizar seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON user_profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserção via trigger
DROP POLICY IF EXISTS "Permitir inserção via sistema" ON user_profiles;
CREATE POLICY "Permitir inserção via sistema" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. TABELA DE CONTATOS
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

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts(read);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserção pública de contatos" ON contacts;
CREATE POLICY "Permitir inserção pública de contatos" ON contacts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura autenticada de contatos" ON contacts;
CREATE POLICY "Permitir leitura autenticada de contatos" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização autenticada de contatos" ON contacts;
CREATE POLICY "Permitir atualização autenticada de contatos" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir deleção autenticada de contatos" ON contacts;
CREATE POLICY "Permitir deleção autenticada de contatos" ON contacts
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 4. TABELA DE NEWSLETTER
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter(is_active);

ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserção pública de newsletter" ON newsletter;
CREATE POLICY "Permitir inserção pública de newsletter" ON newsletter
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura autenticada de newsletter" ON newsletter;
CREATE POLICY "Permitir leitura autenticada de newsletter" ON newsletter
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização pública de newsletter" ON newsletter;
CREATE POLICY "Permitir atualização pública de newsletter" ON newsletter
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir deleção pública de newsletter" ON newsletter;
CREATE POLICY "Permitir deleção pública de newsletter" ON newsletter
  FOR DELETE USING (true);

-- ============================================
-- 5. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_carros_avaliados_updated_at ON carros_avaliados;
CREATE TRIGGER update_carros_avaliados_updated_at
  BEFORE UPDATE ON carros_avaliados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. FUNÇÃO PARA VERIFICAR SE É ADMIN
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role IN ('admin', 'super_admin') AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. FUNÇÃO PARA VERIFICAR SE É SUPER ADMIN
-- ============================================
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = user_id AND role = 'super_admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
