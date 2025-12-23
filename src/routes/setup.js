const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
// GET /api/setup/status - Verificar status do sistema
// ============================================
router.get('/status', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.json({
        configured: false,
        message: 'Supabase não configurado. Configure SUPABASE_URL e SUPABASE_KEY.',
        tables: {},
        superadmin: false
      });
    }

    // Verificar tabelas existentes
    const tables = {};
    const tableNames = ['carros_avaliados', 'user_profiles', 'contacts', 'newsletter'];

    for (const tableName of tableNames) {
      const { error } = await supabase.from(tableName).select('id').limit(1);
      tables[tableName] = !error;
    }

    // Verificar se existe super admin
    let superadmin = false;
    if (tables.user_profiles) {
      const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'super_admin')
        .limit(1);
      superadmin = data && data.length > 0;
    }

    const allTablesExist = Object.values(tables).every(v => v);

    res.json({
      configured: true,
      ready: allTablesExist && superadmin,
      message: allTablesExist
        ? (superadmin ? 'Sistema pronto!' : 'Tabelas OK. Falta criar super admin.')
        : 'Execute as migrações no Supabase SQL Editor.',
      tables,
      superadmin
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      error: 'Erro ao verificar status do sistema'
    });
  }
});

// ============================================
// GET /api/setup/migrations - Obter SQL das migracoes
// ============================================
router.get('/migrations', async (req, res) => {
  try {
    const migrationsDir = path.join(__dirname, '../../supabase/migrations');

    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      // Fallback to database/schema.sql
      const schemaPath = path.join(__dirname, '../../database/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        return res.json({
          success: true,
          source: 'database/schema.sql',
          sql
        });
      }
      return res.status(404).json({
        error: 'Arquivos de migracao nao encontrados'
      });
    }

    // Read complete schema migration
    const completeSchemaPath = path.join(migrationsDir, '00000000000000_complete_schema.sql');
    if (fs.existsSync(completeSchemaPath)) {
      const sql = fs.readFileSync(completeSchemaPath, 'utf8');
      return res.json({
        success: true,
        source: 'supabase/migrations/00000000000000_complete_schema.sql',
        sql
      });
    }

    // Read all migration files and combine them
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let combinedSql = '-- Combined migrations from supabase/migrations/\n\n';

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      combinedSql += `-- File: ${file}\n${content}\n\n`;
    }

    res.json({
      success: true,
      source: 'supabase/migrations',
      files: files,
      sql: combinedSql
    });

  } catch (error) {
    console.error('Erro ao ler migracoes:', error);
    res.status(500).json({
      error: 'Erro ao ler arquivos de migracao'
    });
  }
});

// ============================================
// GET /api/setup/migrations/list - Listar arquivos de migracao
// ============================================
router.get('/migrations/list', async (req, res) => {
  try {
    const migrationsDir = path.join(__dirname, '../../supabase/migrations');

    if (!fs.existsSync(migrationsDir)) {
      return res.json({
        success: true,
        migrations: []
      });
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
      .map(file => {
        const filePath = path.join(migrationsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime
        };
      });

    res.json({
      success: true,
      migrations: files
    });

  } catch (error) {
    console.error('Erro ao listar migracoes:', error);
    res.status(500).json({
      error: 'Erro ao listar arquivos de migracao'
    });
  }
});

// ============================================
// POST /api/setup/init - Inicializar sistema (criar super admin)
// ============================================
router.post('/init', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase não configurado'
      });
    }

    const { email, password, full_name, setup_key } = req.body;

    // Verificar chave de setup (segurança básica)
    const expectedKey = process.env.SETUP_KEY || 'premium-car-setup-2024';
    if (setup_key !== expectedKey) {
      return res.status(403).json({
        error: 'Chave de setup inválida'
      });
    }

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 8 caracteres'
      });
    }

    // Verificar se já existe super admin
    const { data: existingAdmin } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return res.status(400).json({
        error: 'Já existe um super admin configurado'
      });
    }

    // Criar usuário super admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || 'Super Admin',
        role: 'super_admin'
      }
    });

    if (authError) {
      console.error('Erro ao criar super admin:', authError);
      return res.status(400).json({
        error: authError.message || 'Erro ao criar super admin'
      });
    }

    // Atualizar perfil para super_admin (o trigger pode não ter definido corretamente)
    await supabase
      .from('user_profiles')
      .upsert({
        id: authData.user.id,
        email: email.toLowerCase().trim(),
        full_name: full_name || 'Super Admin',
        role: 'super_admin',
        is_active: true
      });

    res.status(201).json({
      success: true,
      message: 'Super admin criado com sucesso!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'super_admin'
      }
    });

  } catch (error) {
    console.error('Erro ao inicializar sistema:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// POST /api/setup/create-admin - Criar novo admin (requer super admin)
// ============================================
router.post('/create-admin', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase não configurado'
      });
    }

    // Verificar autenticação
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
        error: 'Token inválido'
      });
    }

    // Verificar se é super admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return res.status(403).json({
        error: 'Apenas super admins podem criar novos admins'
      });
    }

    const { email, password, full_name, role = 'admin' } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios'
      });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        error: 'Role inválida. Use "admin" ou "user"'
      });
    }

    // Criar usuário
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '',
        role: role
      }
    });

    if (createError) {
      return res.status(400).json({
        error: createError.message
      });
    }

    // Atualizar perfil
    await supabase
      .from('user_profiles')
      .upsert({
        id: authData.user.id,
        email: email.toLowerCase().trim(),
        full_name: full_name || '',
        role: role,
        is_active: true
      });

    res.status(201).json({
      success: true,
      message: `${role === 'admin' ? 'Admin' : 'Usuário'} criado com sucesso!`,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role
      }
    });

  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// GET /api/setup/users - Listar usuários (requer admin)
// ============================================
router.get('/users', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase não configurado'
      });
    }

    // Verificar autenticação
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
        error: 'Token inválido'
      });
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Buscar usuários
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      users: users || []
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// PUT /api/setup/users/:id/role - Alterar role de usuário
// ============================================
router.put('/users/:id/role', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase não configurado'
      });
    }

    // Verificar autenticação
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
        error: 'Token inválido'
      });
    }

    // Verificar se é super admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return res.status(403).json({
        error: 'Apenas super admins podem alterar roles'
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        error: 'Role inválida'
      });
    }

    // Não permitir alterar própria role
    if (id === user.id) {
      return res.status(400).json({
        error: 'Você não pode alterar sua própria role'
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Role atualizada com sucesso',
      user: data
    });

  } catch (error) {
    console.error('Erro ao alterar role:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// DELETE /api/setup/users/:id - Desativar usuário
// ============================================
router.delete('/users/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase não configurado'
      });
    }

    // Verificar autenticação
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
        error: 'Token inválido'
      });
    }

    // Verificar se é super admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return res.status(403).json({
        error: 'Apenas super admins podem desativar usuários'
      });
    }

    const { id } = req.params;

    // Não permitir desativar a si mesmo
    if (id === user.id) {
      return res.status(400).json({
        error: 'Você não pode desativar sua própria conta'
      });
    }

    // Desativar usuário (não deleta, apenas marca como inativo)
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// ============================================
// POST /api/setup/seed - Popular banco com dados de exemplo
// ============================================
router.post('/seed', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(500).json({
        error: 'Supabase não configurado'
      });
    }

    const { setup_key } = req.body;

    // Verificar chave de setup
    const expectedKey = process.env.SETUP_KEY || 'premium-car-setup-2024';
    if (setup_key !== expectedKey) {
      return res.status(403).json({
        error: 'Chave de setup inválida'
      });
    }

    // Dados de exemplo para carros
    const carrosExemplo = [
      {
        titulo: 'BMW M3 Competition 2023 - O Esportivo Definitivo',
        descricao: 'O BMW M3 Competition representa o ápice da engenharia alemã em sedãs esportivos. Com seu motor S58 biturbo de 6 cilindros em linha produzindo 510 cv, este veículo oferece uma experiência de condução incomparável. O interior combina luxo com esportividade, enquanto a tecnologia de ponta garante performance e segurança. Ideal para quem busca emoção nas ruas sem abrir mão do conforto diário.',
        marca: 'BMW',
        modelo: 'M3 Competition',
        ano: 2023,
        preco_estimado: 750000,
        nota_geral: 9,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        imagem_url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
      },
      {
        titulo: 'Mercedes-AMG GT 63 S - Luxo e Performance',
        descricao: 'O Mercedes-AMG GT 63 S é a combinação perfeita de um grand tourer com um superesportivo. Equipado com motor V8 biturbo de 4.0 litros que entrega 639 cv, este modelo oferece aceleração brutal e refinamento exemplar. O interior é um showcase de tecnologia e materiais premium. Um carro para quem não aceita compromissos entre conforto e adrenalina.',
        marca: 'Mercedes-Benz',
        modelo: 'AMG GT 63 S',
        ano: 2023,
        preco_estimado: 1200000,
        nota_geral: 10,
        video_url: null,
        imagem_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'
      },
      {
        titulo: 'Porsche 911 Carrera S - O Ícone Reinventado',
        descricao: 'O Porsche 911 Carrera S continua a tradição de mais de 60 anos de excelência automobilística. Com motor boxer de 3.0 litros biturbo gerando 450 cv, oferece a experiência 911 autêntica com tecnologia contemporânea. A dirigibilidade é excepcional, combinando precisão cirúrgica com conforto surpreendente. Um clássico moderno que define o segmento de esportivos.',
        marca: 'Porsche',
        modelo: '911 Carrera S',
        ano: 2024,
        preco_estimado: 950000,
        nota_geral: 10,
        video_url: null,
        imagem_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?w=800'
      },
      {
        titulo: 'Audi RS6 Avant - A Perua Mais Rápida do Mundo',
        descricao: 'O Audi RS6 Avant desafia convenções ao combinar a praticidade de uma perua com performance de superesportivo. Seu V8 biturbo de 4.0 litros produz 600 cv, impulsionando a família de 0 a 100 km/h em apenas 3,6 segundos. O interior é espaçoso e tecnológico, perfeito para viagens longas ou arrancadas no semáforo. Para quem quer tudo, sem abrir mão de nada.',
        marca: 'Audi',
        modelo: 'RS6 Avant',
        ano: 2023,
        preco_estimado: 890000,
        nota_geral: 9,
        video_url: null,
        imagem_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'
      },
      {
        titulo: 'Ferrari Roma - Elegância Italiana',
        descricao: 'A Ferrari Roma representa a nova era do grand touring italiano. Com design inspirado na Roma dos anos 60, combina elegância atemporal com tecnologia de F1. O motor V8 biturbo de 3.9 litros entrega 620 cv com um som característico Ferrari. O interior é minimalista e luxuoso, focado no prazer de dirigir. Uma obra de arte sobre rodas que emociona a cada curva.',
        marca: 'Ferrari',
        modelo: 'Roma',
        ano: 2024,
        preco_estimado: 2500000,
        nota_geral: 10,
        video_url: null,
        imagem_url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800'
      }
    ];

    // Inserir carros
    const { data: carrosData, error: carrosError } = await supabase
      .from('carros_avaliados')
      .insert(carrosExemplo)
      .select();

    if (carrosError) {
      console.error('Erro ao inserir carros:', carrosError);
      return res.status(400).json({
        error: 'Erro ao popular carros: ' + carrosError.message
      });
    }

    res.json({
      success: true,
      message: 'Banco populado com sucesso!',
      inserted: {
        carros: carrosData?.length || 0
      }
    });

  } catch (error) {
    console.error('Erro ao popular banco:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
