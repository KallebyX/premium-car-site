const express = require('express');
const router = express.Router();
const supabase = require('../../supabase');
const { createClient } = require('@supabase/supabase-js');
const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET - Listar todos os carros avaliados
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('carros_avaliados')
    .select('*')
    .order('data_postagem', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST - Criar nova avaliação de carro
router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token inválido ou expirado' });

  const {
    titulo,
    descricao,
    marca,
    modelo,
    ano,
    preco_estimado,
    nota_geral,
    video_url,
    imagem_url
  } = req.body;

  const { data, error } = await supabase
    .from('carros_avaliados')
    .insert([{
      titulo,
      descricao,
      marca,
      modelo,
      ano,
      preco_estimado,
      nota_geral,
      video_url,
      imagem_url,
      autor_email: user.email
    }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT - Atualizar avaliação por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    descricao,
    marca,
    modelo,
    ano,
    preco_estimado,
    nota_geral,
    video_url,
    imagem_url
  } = req.body;

  const { data, error } = await supabase
    .from('carros_avaliados')
    .update({
      titulo,
      descricao,
      marca,
      modelo,
      ano,
      preco_estimado,
      nota_geral,
      video_url,
      imagem_url
    })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE - Excluir avaliação por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('carros_avaliados')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send(); // sucesso sem conteúdo
});

module.exports = router;