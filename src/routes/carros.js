const express = require('express');
const router = express.Router();
const supabase = require('../../supabase');
const { authenticateToken, validateCarData } = require('../middleware/auth');

// GET - Listar todos os carros avaliados (público)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('carros_avaliados')
      .select('*')
      .order('data_postagem', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET - Obter um carro específico por ID (público)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('carros_avaliados')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST - Criar nova avaliação de carro (requer autenticação)
router.post('/', authenticateToken, validateCarData, async (req, res, next) => {
  try {
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
        video_url: video_url || null,
        imagem_url: imagem_url || null,
        autor_email: req.user.email
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
});

// PUT - Atualizar avaliação por ID (requer autenticação)
router.put('/:id', authenticateToken, validateCarData, async (req, res, next) => {
  try {
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
        video_url: video_url || null,
        imagem_url: imagem_url || null
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }

    res.json(data[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE - Excluir avaliação por ID (requer autenticação)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('carros_avaliados')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;