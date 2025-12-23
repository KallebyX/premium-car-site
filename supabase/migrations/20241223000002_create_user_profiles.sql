-- ============================================
-- Migration: Create user_profiles table
-- Description: User profile with roles
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON user_profiles;
CREATE POLICY "Usuarios podem ver seu proprio perfil" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can view all profiles
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON user_profiles;
CREATE POLICY "Admins podem ver todos os perfis" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Usuarios podem atualizar seu proprio perfil" ON user_profiles;
CREATE POLICY "Usuarios podem atualizar seu proprio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow system insert (for trigger)
DROP POLICY IF EXISTS "Permitir insercao via sistema" ON user_profiles;
CREATE POLICY "Permitir insercao via sistema" ON user_profiles
  FOR INSERT WITH CHECK (true);
