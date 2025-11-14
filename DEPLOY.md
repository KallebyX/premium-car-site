# 🚀 Guia de Deploy - Premium Car

Este guia detalha os passos para fazer deploy do sistema Premium Car na Vercel.

## 📋 Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta na Vercel (pode usar login do GitHub)
- [ ] Projeto Supabase configurado
- [ ] Repositório Git com o código

## 🔧 Preparação

### 1. Configurar Supabase para Produção

#### 1.1. Políticas de Segurança (RLS)

No Supabase, ative Row Level Security (RLS) para a tabela `carros_avaliados`:

```sql
-- Habilitar RLS
ALTER TABLE carros_avaliados ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Permitir leitura pública"
  ON carros_avaliados
  FOR SELECT
  USING (true);

-- Política para inserção (apenas autenticados)
CREATE POLICY "Permitir inserção autenticada"
  ON carros_avaliados
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para atualização (apenas autenticados)
CREATE POLICY "Permitir atualização autenticada"
  ON carros_avaliados
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Política para exclusão (apenas autenticados)
CREATE POLICY "Permitir exclusão autenticada"
  ON carros_avaliados
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
```

#### 1.2. Configurar Storage

1. Acesse **Storage** > **imagens**
2. Configure as políticas:

```sql
-- Leitura pública
CREATE POLICY "Permitir leitura pública de imagens"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'imagens');

-- Upload apenas para autenticados
CREATE POLICY "Permitir upload autenticado"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'imagens' AND auth.uid() IS NOT NULL);
```

### 2. Preparar Repositório

#### 2.1. Atualizar .gitignore

Certifique-se de que o `.gitignore` inclui:

```
node_modules/
.env
.env.local
.DS_Store
*.log
.vercel
```

#### 2.2. Commit e Push

```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

## 🌐 Deploy na Vercel

### Método 1: Via Dashboard (Recomendado)

#### Passo 1: Importar Projeto

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Selecione seu repositório do GitHub
4. Clique em **"Import"**

#### Passo 2: Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_service_role_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Use a **Service Role Key** (não a anon key) para `SUPABASE_KEY`
- A **Anon Key** vai em `SUPABASE_ANON_KEY`
- Obtenha as chaves em: Supabase > Settings > API

#### Passo 3: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Seu site estará disponível em: `https://seu-projeto.vercel.app`

### Método 2: Via CLI

#### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Passo 2: Login

```bash
vercel login
```

#### Passo 3: Deploy

```bash
# Deploy de desenvolvimento
vercel

# Deploy de produção
vercel --prod
```

#### Passo 4: Configurar Variáveis de Ambiente

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add SUPABASE_ANON_KEY
```

## ✅ Verificação Pós-Deploy

### 1. Testar Funcionalidades

- [ ] Acessar página inicial
- [ ] Listar carros
- [ ] Ver detalhes de um carro
- [ ] Acessar páginas institucionais
- [ ] Fazer login no admin
- [ ] Criar/editar/excluir avaliação
- [ ] Upload de imagem
- [ ] Testar em mobile

### 2. Performance

Use [Google PageSpeed Insights](https://pagespeed.web.dev/) para verificar performance:

```
https://pagespeed.web.dev/?url=https://seu-projeto.vercel.app
```

Metas:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 3. SEO

Verifique:
- [ ] Meta tags presentes
- [ ] Open Graph configurado
- [ ] Sitemap (opcional)
- [ ] robots.txt (opcional)

## 🔒 Segurança Pós-Deploy

### 1. Verificar Variáveis de Ambiente

No Vercel Dashboard:
1. Settings > Environment Variables
2. Certifique-se de que todas as chaves estão configuradas
3. Nunca exponha a Service Role Key no frontend

### 2. Configurar Domínio Customizado (Opcional)

1. Vercel Dashboard > Settings > Domains
2. Adicione seu domínio: `premiumcar.com.br`
3. Configure DNS conforme instruções da Vercel

### 3. HTTPS

- A Vercel fornece HTTPS automático
- Certifique-se de que todas as requisições usam HTTPS

### 4. Rate Limiting

O rate limiting está configurado no código (100 req/min).

Para produção, considere usar Vercel Edge Config ou serviços externos como:
- Upstash Redis
- Cloudflare
- Kong

## 🔄 CI/CD Automático

### Deploy Automático

A Vercel faz deploy automático em:
- **Push para `main`**: Deploy em produção
- **Pull Requests**: Preview deployments

### Preview Deployments

Toda PR gera uma URL de preview:
```
https://seu-projeto-pr123.vercel.app
```

### Branch Deployments

Configure branches adicionais:
1. Vercel Dashboard > Settings > Git
2. Adicione branches para staging: `staging`, `develop`

## 📊 Monitoramento

### Vercel Analytics

1. Vercel Dashboard > Analytics
2. Ative o Vercel Analytics (grátis para hobby)
3. Acompanhe:
   - Page views
   - Unique visitors
   - Top pages
   - Device types

### Logs

Visualize logs em tempo real:
```bash
vercel logs seu-projeto.vercel.app
```

### Supabase Dashboard

Monitore:
- Número de requisições à API
- Uso do Storage
- Autenticações

## 🐛 Troubleshooting

### Erro: "Module not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
npm install
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### Erro: "Supabase connection failed"

**Causa:** Variáveis de ambiente incorretas

**Solução:**
1. Vercel Dashboard > Settings > Environment Variables
2. Verifique se todas as variáveis estão corretas
3. Redeploy: Settings > Deployments > ... > Redeploy

### Erro 500 em Produção

**Causa:** Erro no código ou configuração

**Solução:**
```bash
# Ver logs
vercel logs seu-projeto.vercel.app --follow

# Verificar no Vercel Dashboard
# Functions > Logs
```

### Imagens não carregam

**Causa:** Storage não configurado corretamente

**Solução:**
1. Supabase > Storage > imagens
2. Verifique se o bucket é público
3. Teste URL diretamente no navegador

## 🔄 Rollback

Se algo der errado:

1. Vercel Dashboard > Deployments
2. Encontre o deployment anterior que funcionava
3. Clique em **"..."** > **"Promote to Production"**

Ou via CLI:
```bash
vercel rollback
```

## 📱 PWA (Opcional)

Para transformar em PWA:

### 1. Criar manifest.json

```json
{
  "name": "Premium Car",
  "short_name": "Premium Car",
  "description": "Avaliações Automotivas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#dc3545",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Adicionar no HTML

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#dc3545">
```

### 3. Service Worker (Opcional)

Para cache offline, adicione um service worker.

## 📈 Otimizações Adicionais

### 1. Lazy Loading de Imagens

Já implementado com `loading="lazy"`.

### 2. Minificação

A Vercel faz minificação automática.

### 3. CDN

A Vercel usa CDN global automaticamente.

### 4. Compression

Ative compression no server.js:

```javascript
const compression = require('compression');
app.use(compression());
```

## 🎯 Checklist Final

- [ ] Deploy funcionando
- [ ] Todas as páginas carregando
- [ ] Login funcionando
- [ ] CRUD funcionando
- [ ] Upload de imagens funcionando
- [ ] Mobile responsivo
- [ ] Performance > 90
- [ ] HTTPS ativo
- [ ] Domínio customizado (se aplicável)
- [ ] Analytics ativo
- [ ] Backups configurados

## 📞 Suporte

Se encontrar problemas:

1. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
2. **Supabase Support**: [supabase.com/support](https://supabase.com/support)
3. **GitHub Issues**: Abra uma issue no repositório

## 🎉 Parabéns!

Seu sistema Premium Car está no ar! 🚗

Acesse: `https://seu-projeto.vercel.app`

---

**Última atualização:** Novembro 2024
