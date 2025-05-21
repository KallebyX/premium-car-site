# 🚗 Premium Car

**Auxiliamos você a fazer um bom negócio!**

Este é o site oficial da *Premium Car*, uma empresa especializada em avaliações automotivas para YouTube, TikTok e Instagram.  
Aqui o cliente encontra análises completas dos veículos avaliados, com vídeos, ficha técnica, fotos e muito mais.

---

## 📸 Canal no YouTube

👉 [@CarPremium001](https://www.youtube.com/@CarPremium001)

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Node.js + Express
- **Banco de Dados**: Supabase (PostgreSQL + API REST)
- **Armazenamento de imagens**: Supabase Storage
- **Deploy**: Vercel
- **Painel Admin**: CRUD básico com acesso restrito ao administrador

---

## ⚙️ Funcionalidades

- [x] Página inicial com vídeos em destaque e carros recentes
- [x] Lista de carros avaliados com busca
- [x] Página detalhada de cada veículo
- [x] Painel administrativo para cadastrar e editar avaliações
- [x] Upload de imagens para Supabase
- [x] Design responsivo baseado na identidade visual da marca

---

## 🧪 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/KallebyX/premium-car-site.git
cd premium-car-site

# Instale as dependências
npm install

# Crie um arquivo .env e adicione suas chaves do Supabase
touch .env
# Edite o arquivo e insira:
SUPABASE_URL=https://zfdygzdtufhvhzwtvuma.supabase.co
SUPABASE_KEY=your-service-role-key-aqui

# Inicie o servidor local
node server.js

# Acesse o projeto no navegador
http://localhost:3000
```