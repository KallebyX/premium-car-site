const express = require('express');
const router = express.Router();
const supabase = require('../../supabase');
const { authenticateToken, validateCarData } = require('../middleware/auth');

// GET - Listar carros avaliados com paginação e filtros (público)
router.get('/', async (req, res, next) => {
  try {
    // Parâmetros de paginação
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Parâmetros de ordenação
    const sortBy = req.query.sortBy || 'data_postagem';
    const sortOrder = req.query.sortOrder === 'asc' ? true : false;

    // Parâmetros de filtro
    const { marca, modelo, ano_min, ano_max, preco_min, preco_max, nota_min, search } = req.query;

    // Construir query
    let query = supabase
      .from('carros_avaliados')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (marca) {
      query = query.ilike('marca', `%${marca}%`);
    }
    if (modelo) {
      query = query.ilike('modelo', `%${modelo}%`);
    }
    if (ano_min) {
      query = query.gte('ano', parseInt(ano_min));
    }
    if (ano_max) {
      query = query.lte('ano', parseInt(ano_max));
    }
    if (preco_min) {
      query = query.gte('preco_estimado', parseFloat(preco_min));
    }
    if (preco_max) {
      query = query.lte('preco_estimado', parseFloat(preco_max));
    }
    if (nota_min) {
      query = query.gte('nota_geral', parseInt(nota_min));
    }
    if (search) {
      query = query.or(`titulo.ilike.%${search}%,marca.ilike.%${search}%,modelo.ilike.%${search}%,descricao.ilike.%${search}%`);
    }

    // Aplicar ordenação e paginação
    const validSortFields = ['data_postagem', 'preco_estimado', 'nota_geral', 'ano', 'marca', 'modelo'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'data_postagem';

    query = query
      .order(sortField, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Calcular informações de paginação
    const totalPages = Math.ceil((count || 0) / limit);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
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