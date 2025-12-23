// Middleware de autenticação
const { createClient } = require('@supabase/supabase-js');

// Lazy initialization of Supabase client to avoid errors when env vars are not set
let supabaseAuth = null;

function getSupabaseAuth() {
  if (!supabaseAuth && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    supabaseAuth = createClient(
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
  return supabaseAuth;
}

async function authenticateToken(req, res, next) {
  try {
    const supabase = getSupabaseAuth();

    if (!supabase) {
      return res.status(500).json({
        error: 'Serviço de autenticação não configurado'
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticação ausente ou inválido'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Buscar perfil do usuário para obter role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_active, full_name')
      .eq('id', user.id)
      .single();

    // Verificar se usuário está ativo
    if (profile && !profile.is_active) {
      return res.status(403).json({
        error: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    // Adicionar usuário e perfil ao request para uso posterior
    req.user = {
      ...user,
      role: profile?.role || 'user',
      full_name: profile?.full_name || '',
      is_active: profile?.is_active ?? true
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      error: 'Erro ao verificar autenticação'
    });
  }
}

// Middleware para verificar se é admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Não autenticado'
    });
  }

  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Acesso negado. Permissão de administrador necessária.'
    });
  }

  next();
}

// Middleware para verificar se é super admin
function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Não autenticado'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Acesso negado. Permissão de super administrador necessária.'
    });
  }

  next();
}

// Middleware de validação de dados
function validateCarData(req, res, next) {
  const { 
    titulo, 
    descricao, 
    marca, 
    modelo, 
    ano, 
    preco_estimado, 
    nota_geral 
  } = req.body;

  const errors = [];

  // Validações
  if (!titulo || titulo.trim().length < 10) {
    errors.push('Título deve ter pelo menos 10 caracteres');
  }

  if (!descricao || descricao.trim().length < 100) {
    errors.push('Descrição deve ter pelo menos 100 caracteres');
  }

  if (!marca || marca.trim().length === 0) {
    errors.push('Marca é obrigatória');
  }

  if (!modelo || modelo.trim().length === 0) {
    errors.push('Modelo é obrigatório');
  }

  if (!ano || ano < 1900 || ano > 2030) {
    errors.push('Ano inválido (deve estar entre 1900 e 2030)');
  }

  if (preco_estimado === undefined || preco_estimado < 0) {
    errors.push('Preço estimado inválido');
  }

  if (!nota_geral || nota_geral < 1 || nota_geral > 10) {
    errors.push('Nota deve estar entre 1 e 10');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Dados inválidos', 
      details: errors 
    });
  }

  // Sanitizar dados
  req.body.titulo = titulo.trim();
  req.body.descricao = descricao.trim();
  req.body.marca = marca.trim();
  req.body.modelo = modelo.trim();
  req.body.ano = parseInt(ano);
  req.body.preco_estimado = parseFloat(preco_estimado);
  req.body.nota_geral = parseInt(nota_geral);

  if (req.body.video_url) {
    req.body.video_url = req.body.video_url.trim();
  }

  next();
}

// Middleware de rate limiting simples
const requestCounts = new Map();

function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = requestCounts.get(ip);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Muitas requisições. Tente novamente mais tarde.' 
      });
    }

    record.count++;
    next();
  };
}

// Middleware de log de erros
function errorLogger(err, req, res, next) {
  console.error('Erro:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  next(err);
}

// Middleware de tratamento de erros
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  validateCarData,
  rateLimiter,
  errorLogger,
  errorHandler
};
