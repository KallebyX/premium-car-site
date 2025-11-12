const express = require('express');
const router = express.Router();
const supabase = require('../../supabase');

// POST - Criar nova mensagem de contato (público)
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validação básica
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert([{
      name,
      email,
      phone: phone || null,
      subject,
      message
    }]);

  if (error) {
    console.error('Erro ao salvar contato:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!' });
});

module.exports = router;
