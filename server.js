require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const carrosRoutes = require('./src/routes/carros');
const uploadRoutes = require('./src/routes/upload');
const contactsRoutes = require('./src/routes/contacts');
const { rateLimiter, errorLogger, errorHandler } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de segurança
app.disable('x-powered-by');

// CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing com limites
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter(100, 60000)); // 100 requisições por minuto

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));

// Rotas da API
app.use('/api/carros', carrosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactsRoutes);

// Rota para home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'admin', 'painel.html'));
});

// Endpoint para fornecer configuração pública do Supabase
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middlewares
app.use(errorLogger);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🚗 Premium Car Server 🚗          ║
╠════════════════════════════════════════╣
║  Servidor: http://localhost:${PORT}${' '.repeat(10-PORT.toString().length)}║
║  Ambiente: ${process.env.NODE_ENV || 'development'}${' '.repeat(13-(process.env.NODE_ENV || 'development').length)}║
║  Data: ${new Date().toLocaleDateString('pt-BR')}${' '.repeat(17-new Date().toLocaleDateString('pt-BR').length)}║
╚════════════════════════════════════════╝
  `);
});
