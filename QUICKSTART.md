# 🚀 Quick Start - Premium Car

Guia rápido para começar a usar o Premium Car em 5 minutos!

## ⚡ Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/KallebyX/premium-car-site.git
cd premium-car-site

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# 4. Inicie o servidor
npm start
```

Acesse: **http://localhost:3000**

---

## 🔑 Variáveis de Ambiente Necessárias

Edite o arquivo `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_service_role_key
SUPABASE_ANON_KEY=sua_anon_key
PORT=3000
NODE_ENV=development
```

**Onde encontrar:**
1. Acesse [supabase.com](https://supabase.com)
2. Seu projeto > Settings > API
3. Copie URL e as chaves

---

## 🗄️ Configurar Banco de Dados

No Supabase SQL Editor, execute:

```sql
CREATE TABLE carros_avaliados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  preco_estimado NUMERIC NOT NULL,
  nota_geral INTEGER NOT NULL CHECK (nota_geral >= 1 AND nota_geral <= 10),
  video_url TEXT,
  imagem_url TEXT,
  autor_email TEXT,
  data_postagem TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_carros_data ON carros_avaliados(data_postagem DESC);
```

---

## 📸 Configurar Storage

1. Supabase > Storage
2. Criar bucket: **imagens**
3. Tornar público

---

## 👤 Criar Usuário Admin

1. Supabase > Authentication > Users
2. Add user > Email: admin@example.com
3. Use este email/senha para login

---

## ✅ Verificar Instalação

- [ ] Servidor rodando em http://localhost:3000
- [ ] Página inicial carrega
- [ ] Login funciona (/login.html)
- [ ] Painel admin acessível (/admin)

---

## 📚 Próximos Passos

1. **Ler a documentação completa**: `README.md`
2. **Entender a API**: `API.md`
3. **Fazer deploy**: `DEPLOY.md`

---

## 🆘 Problemas?

### Erro: "SUPABASE_URL is required"
**Solução:** Configure o arquivo `.env` corretamente

### Erro: "Token inválido"
**Solução:** Faça logout e login novamente

### Porta 3000 em uso
**Solução:** Altere `PORT=3001` no `.env`

---

## 📞 Suporte

- **Documentação**: Leia `README.md`
- **API**: Veja `API.md`
- **Deploy**: Siga `DEPLOY.md`
- **Issues**: [GitHub Issues](https://github.com/KallebyX/premium-car-site/issues)

---

**Boa sorte! 🚗💨**
