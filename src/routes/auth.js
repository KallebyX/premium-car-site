const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Lazy initialization of Supabase client
let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabaseAdmin;
}

// ============================================
// POST /api/auth/register - Registrar novo usuário
// ============================================
router.post('/register', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Serviço de autenticação não configurado'
      });
    }

    const { email, password, full_name } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de e-mail inválido'
      });
    }

    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true, // Auto-confirma o email
      user_metadata: {
        full_name: full_name || ''
      }
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);

      if (error.message.includes('already registered')) {
        return res.status(400).json({
          error: 'Este e-mail já está registrado'
        });
      }

      return res.status(400).json({
        error: error.message || 'Erro ao criar usuário'
      });
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: full_name || ''
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// POST /api/auth/login - Login de usuário
// ============================================
router.post('/login', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Serviço de autenticação não configurado'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios'
      });
    }

    // Fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });

    if (error) {
      console.error('Erro no login:', error);
      return res.status(401).json({
        error: 'E-mail ou senha incorretos'
      });
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login realizado com sucesso',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || '',
        role: profile?.role || 'user'
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// GET /api/auth/me - Obter dados do usuário atual
// ============================================
router.get('/me', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Serviço de autenticação não configurado'
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verificar token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Buscar perfil
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || '',
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url || null,
        is_active: profile?.is_active ?? true
      }
    });

  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// POST /api/auth/logout - Logout
// ============================================
router.post('/logout', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Serviço de autenticação não configurado'
      });
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Invalidar sessão no Supabase (opcional)
      // await supabase.auth.signOut();
    }

    res.json({
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// PUT /api/auth/profile - Atualizar perfil
// ============================================
router.put('/profile', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Serviço de autenticação não configurado'
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    const { full_name, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: full_name,
        avatar_url: avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: 'Erro ao atualizar perfil'
      });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      profile: data
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// POST /api/auth/change-password - Alterar senha
// ============================================
router.post('/change-password', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Serviço de autenticação não configurado'
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        error: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: new_password
    });

    if (error) {
      return res.status(400).json({
        error: 'Erro ao alterar senha'
      });
    }

    res.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
