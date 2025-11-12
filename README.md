# 🚗 Premium Car - Plataforma de Avaliações Automotivas

![Premium Car](https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300&q=80)

**Auxiliamos você a fazer um bom negócio!**

Premium Car é uma plataforma completa de avaliações automotivas profissionais, oferecendo análises detalhadas, vídeos, especificações técnicas e muito mais. O projeto integra conteúdo do YouTube, TikTok e Instagram em uma experiência web moderna e responsiva.

👉 **Canal no YouTube**: [@CarPremium001](https://www.youtube.com/@CarPremium001)

---

## ✨ Funcionalidades

### 🌐 Frontend Público
- ✅ **Página Inicial Profissional**: Hero section com imagem de fundo, estatísticas dinâmicas e grid de carros
- ✅ **Sistema de Busca e Filtros**: Busca em tempo real por marca, modelo, título e nota mínima
- ✅ **Página de Detalhes Completa**: Layout profissional com especificações, vídeo do YouTube embutido e botões de compartilhamento social
- ✅ **Formulário de Contato Funcional**: Integrado com Supabase para armazenamento de mensagens
- ✅ **Páginas Institucionais**: Sobre Nós, Parcerias, Fale Conosco
- ✅ **Design Responsivo**: Mobile-first, otimizado para todos os dispositivos
- ✅ **SEO Otimizado**: Meta tags, Open Graph, descrições dinâmicas
- ✅ **Lazy Loading**: Carregamento otimizado de imagens

### 🔐 Painel Administrativo
- ✅ **Autenticação Segura**: Login via Supabase Auth com JWT
- ✅ **CRUD Completo**: Criar, Ler, Atualizar e Deletar avaliações
- ✅ **Upload Seguro de Imagens**: Validação de tipo/tamanho, upload via backend
- ✅ **Paginação Inteligente**: 10 itens por página com navegação
- ✅ **Busca e Filtros**: Filtragem em tempo real na tabela de administração
- ✅ **Preview de Imagens**: Visualização antes do upload
- ✅ **Interface Moderna**: Dashboard com estatísticas e design profissional
- ✅ **Logout Funcional**: Sistema de autenticação completo

### 🔒 Segurança
- ✅ **Chaves de API Seguras**: Sem hardcoding, todas as chaves em variáveis de ambiente
- ✅ **Rotas Protegidas**: Autenticação JWT em todas as rotas sensíveis (POST, PUT, DELETE)
- ✅ **Upload Seguro**: Processamento server-side com validação
- ✅ **Proteção de Rotas**: Redirecionamento automático se não autenticado

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** v18+
- **Express** v5.1.0
- **Supabase Client** v2.56.1 (PostgreSQL)
- **dotenv** v16.6.1

### Frontend
- **HTML5**, **CSS3**, **JavaScript** (Vanilla)
- **Bootstrap** v5.3.0
- **Bootstrap Icons** v1.10.0

### Banco de Dados e Armazenamento
- **Supabase** (PostgreSQL + API REST + Auth + Storage)
- Tabela: `carros_avaliados`
- Tabela: `contacts`
- Storage Bucket: `imagens`

### Deploy
- **Vercel** (configurado via `vercel.json`)

---

## 📁 Estrutura do Projeto

```
premium-car-site/
├── public/                    # Frontend (páginas HTML)
│   ├── index.html            # Página inicial com hero, filtros e grid
│   ├── detalhe.html          # Página de detalhes do carro
│   ├── login.html            # Login administrativo
│   ├── fale-conosco.html     # Formulário de contato
│   ├── sobre-nos.html        # Sobre a empresa
│   ├── parcerias.html        # Página de parcerias
│   └── base.html             # Header/Footer compartilhados
├── src/
│   ├── routes/
│   │   ├── carros.js         # API REST para CRUD de carros
│   │   ├── upload.js         # API para upload seguro de imagens
│   │   └── contacts.js       # API para formulário de contato
│   └── admin/
│       └── painel.html       # Painel administrativo
├── database/
│   └── contacts.sql          # Script SQL para tabela de contatos
├── server.js                 # Servidor Express
├── supabase.js               # Cliente Supabase configurado
├── package.json              # Dependências e scripts
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
├── vercel.json               # Configuração de deploy
└── README.md                 # Este arquivo
```

---

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- **Node.js** v18 ou superior
- Conta no **Supabase** (gratuita)
- **Git**

### 2. Clonar o Repositório

```bash
git clone https://github.com/KallebyX/premium-car-site.git
cd premium-car-site
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Supabase

#### 4.1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **URL** e as **chaves** (Anon Key e Service Role Key)

#### 4.2. Criar Tabela `carros_avaliados`

Execute este SQL no editor do Supabase:

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

#### 4.3. Criar Tabela `contacts`

Execute o script em `database/contacts.sql` no editor do Supabase.

#### 4.4. Criar Bucket de Storage

1. No Supabase, vá em **Storage**
2. Crie um bucket público chamado `imagens`

#### 4.5. Criar Usuário Administrativo

1. No Supabase, vá em **Authentication** > **Users**
2. Crie um novo usuário com email e senha
3. Este será usado para login no painel admin

### 5. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha com suas credenciais do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-service-role-key-aqui
SUPABASE_ANON_KEY=sua-anon-key-aqui
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE:** Nunca compartilhe a **Service Role Key** publicamente!

### 6. Iniciar o Servidor

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

---

## 📖 Como Usar

### Acesso Público

- **Página Inicial**: `http://localhost:3000/`
- **Detalhes do Carro**: `http://localhost:3000/detalhe.html?id={id}`
- **Sobre Nós**: `http://localhost:3000/sobre-nos.html`
- **Parcerias**: `http://localhost:3000/parcerias.html`
- **Fale Conosco**: `http://localhost:3000/fale-conosco.html`

### Acesso Administrativo

1. Acesse `http://localhost:3000/login.html`
2. Faça login com as credenciais criadas no Supabase
3. Você será redirecionado para `http://localhost:3000/admin`
4. No painel, você pode:
   - Criar novas avaliações
   - Editar avaliações existentes
   - Excluir avaliações
   - Fazer upload de imagens
   - Buscar e filtrar avaliações

---

## 🌐 Deploy na Vercel

### 1. Criar Conta na Vercel

Acesse [vercel.com](https://vercel.com) e crie uma conta (pode usar o GitHub).

### 2. Importar Projeto

1. Clique em **"New Project"**
2. Importe o repositório do GitHub
3. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_ANON_KEY`

### 3. Deploy

A Vercel fará o deploy automático. Seu site estará disponível em:
```
https://seu-projeto.vercel.app
```

---

## 🔑 API Endpoints

### Públicos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/carros` | Lista todos os carros |
| GET | `/api/config` | Retorna configuração pública do Supabase |
| POST | `/api/contacts` | Envia mensagem de contato |

### Protegidos (Requerem Autenticação)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/carros` | Cria nova avaliação | JWT Bearer Token |
| PUT | `/api/carros/:id` | Atualiza avaliação | JWT Bearer Token |
| DELETE | `/api/carros/:id` | Deleta avaliação | JWT Bearer Token |
| POST | `/api/upload` | Upload de imagem | JWT Bearer Token |

### Exemplo de Requisição Autenticada

```javascript
fetch('/api/carros', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    titulo: "Teste do Novo Corolla 2024",
    descricao: "Análise completa...",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2024,
    preco_estimado: 150000,
    nota_geral: 9,
    video_url: "https://youtube.com/embed/...",
    imagem_url: "https://..."
  })
});
```

---

## 🎨 Personalização

### Cores Principais

O projeto usa a cor vermelha (`#dc3545`) como cor primária. Para alterar:

- **index.html**: Procure por `.stats-section` e altere o `background`
- **base.html**: Altere as classes `btn-danger` e `text-danger`
- **Bootstrap**: Use variáveis CSS customizadas

### Imagens Hero

As imagens de fundo vêm do Unsplash. Para trocar:

- **index.html**: Linha 13 (`.hero-section`)
- **fale-conosco.html**: Linha 13

---

## 🐛 Solução de Problemas

### Erro: "Token ausente" ou "Token inválido"

**Causa**: Sessão expirada ou não autenticado.
**Solução**: Faça logout e login novamente.

### Erro ao fazer upload de imagem

**Causa**: Bucket `imagens` não existe ou não é público.
**Solução**: Verifique as configurações do Storage no Supabase.

### Página em branco após login

**Causa**: Variáveis de ambiente não configuradas.
**Solução**: Verifique se o arquivo `.env` existe e está correto.

### Erro 500 ao criar/editar avaliação

**Causa**: Problema de conexão com o Supabase ou tabela não criada.
**Solução**: Verifique os logs do console e se a tabela existe no Supabase.

---

## 📝 Scripts Disponíveis

```bash
# Iniciar servidor de produção
npm start

# Iniciar servidor de desenvolvimento
npm run dev
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença ISC.

---

## 📞 Contato

- **YouTube**: [@CarPremium001](https://www.youtube.com/@CarPremium001)
- **GitHub**: [@KallebyX](https://github.com/KallebyX)

---

## 🙏 Agradecimentos

- [Bootstrap](https://getbootstrap.com/) - Framework CSS
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hospedagem
- [Unsplash](https://unsplash.com/) - Imagens de alta qualidade

---

**Desenvolvido com ❤️ e paixão por carros!**
