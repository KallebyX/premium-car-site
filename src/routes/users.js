const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Supabase client with service role (for admin operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration not available');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * GET /api/users
 * Lista todos os usuarios (apenas super_admin)
 */
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    // Buscar perfis de usuarios
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Buscar dados de autenticacao para obter emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    // Combinar dados de perfil com dados de auth
    const users = profiles.map(profile => {
      const authUser = authData.users.find(u => u.id === profile.id);
      return {
        id: profile.id,
        email: authUser?.email || 'Email nao disponivel',
        full_name: profile.full_name,
        role: profile.role || 'user',
        is_active: profile.is_active !== false,
        created_at: profile.created_at || authUser?.created_at,
        last_sign_in: authUser?.last_sign_in_at
      };
    });

    res.json({ users });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Erro ao listar usuarios' });
  }
});

/**
 * GET /api/users/:id
 * Busca um usuario especifico (apenas super_admin)
 */
router.get('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    // Buscar perfil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Usuario nao encontrado' });
      }
      throw profileError;
    }

    // Buscar dados de auth
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(id);

    if (authError) {
      console.error('Error fetching auth user:', authError);
    }

    const user = {
      id: profile.id,
      email: authData?.user?.email || 'Email nao disponivel',
      full_name: profile.full_name,
      role: profile.role || 'user',
      is_active: profile.is_active !== false,
      created_at: profile.created_at,
      last_sign_in: authData?.user?.last_sign_in_at
    };

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuario' });
  }
});

/**
 * PUT /api/users/:id
 * Atualiza um usuario (apenas super_admin)
 */
router.put('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, is_active } = req.body;
    const supabase = getSupabaseAdmin();

    // Verificar se o usuario existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', id)
      .single();

    if (checkError || !existingProfile) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    // Impedir alteracao de outro super_admin (protecao)
    if (existingProfile.role === 'super_admin' && id !== req.user.id) {
      return res.status(403).json({ error: 'Nao e possivel modificar outro Super Admin' });
    }

    // Validar role
    const validRoles = ['user', 'admin', 'super_admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Funcao invalida' });
    }

    // Preparar dados para atualizacao
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    // Atualizar perfil
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    res.json({
      message: 'Usuario atualizado com sucesso',
      user: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuario' });
  }
});

/**
 * DELETE /api/users/:id
 * Deleta um usuario (apenas super_admin)
 * CUIDADO: Esta acao e irreversivel
 */
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    // Verificar se o usuario existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', id)
      .single();

    if (checkError || !existingProfile) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    // Impedir delecao de super_admin
    if (existingProfile.role === 'super_admin') {
      return res.status(403).json({ error: 'Nao e possivel deletar um Super Admin' });
    }

    // Impedir auto-delecao
    if (id === req.user.id) {
      return res.status(403).json({ error: 'Nao e possivel deletar sua propria conta' });
    }

    // Deletar perfil primeiro
    const { error: profileDeleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError);
      throw profileDeleteError;
    }

    // Deletar usuario do auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Nao falhar se o perfil ja foi deletado
    }

    res.json({ message: 'Usuario deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erro ao deletar usuario' });
  }
});

/**
 * POST /api/users/:id/toggle-status
 * Alterna o status ativo/inativo de um usuario
 */
router.post('/:id/toggle-status', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    // Buscar status atual
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, role, is_active')
      .eq('id', id)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ error: 'Usuario nao encontrado' });
    }

    // Impedir alteracao de super_admin
    if (profile.role === 'super_admin') {
      return res.status(403).json({ error: 'Nao e possivel alterar status de Super Admin' });
    }

    const newStatus = !profile.is_active;

    // Atualizar status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      message: `Usuario ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Erro ao alterar status do usuario' });
  }
});

module.exports = router;
