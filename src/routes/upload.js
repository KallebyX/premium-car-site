const express = require('express');
const router = express.Router();
const supabase = require('../../supabase');
const { createClient } = require('@supabase/supabase-js');
const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware para verificar autenticação
async function verificarAuth(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Token inválido ou expirado' });

  req.user = user;
  next();
}

// POST - Upload de imagem (requer autenticação)
router.post('/', verificarAuth, async (req, res) => {
  try {
    const { filename, contentType, fileData } = req.body;

    if (!filename || !fileData) {
      return res.status(400).json({ error: 'Filename e fileData são obrigatórios' });
    }

    // Converter base64 para buffer
    const buffer = Buffer.from(fileData.split(',')[1], 'base64');

    const uniqueFilename = Date.now() + "-" + filename.replace(/\s+/g, '_');

    const { data, error } = await supabase.storage
      .from('imagens')
      .upload(uniqueFilename, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({ error: error.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('imagens')
      .getPublicUrl(uniqueFilename);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
