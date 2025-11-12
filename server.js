
require('dotenv').config();
const express = require('express');
const path = require('path');
const carrosRoutes = require('./src/routes/carros');
const uploadRoutes = require('./src/routes/upload');
const contactsRoutes = require('./src/routes/contacts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/carros', carrosRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactsRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
