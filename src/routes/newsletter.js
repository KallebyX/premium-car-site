const express = require('express');
const router = express.Router();
const supabase = require('../../supabase');

// POST - Inscrever email na newsletter (público)
router.post('/', async (req, res) => {
  const { email } = req.body;

  // Validação básica
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    // Verificar se o email já está inscrito
    const { data: existing } = await supabase
      .from('newsletter')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Este email já está inscrito na newsletter' });
    }

    // Inserir novo inscrito
    const { data, error } = await supabase
      .from('newsletter')
      .insert([{
        email: email.toLowerCase()
      }]);

    if (error) {
      console.error('Erro ao inscrever na newsletter:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ success: true, message: 'Inscrição realizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Cancelar inscrição (com token)
router.delete('/:email', async (req, res) => {
  const { email } = req.params;

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    const { error } = await supabase
      .from('newsletter')
      .delete()
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, message: 'Inscrição cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
