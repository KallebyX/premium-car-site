require('dotenv').config();
const express = require('express');
const path = require('path');
const carrosRoutes = require('./src/routes/carros');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas públicas
app.use('/api/carros', carrosRoutes);

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Painel CRUD (protegido futuramente)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'admin', 'painel.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});