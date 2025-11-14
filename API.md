# 📚 API Documentation - Premium Car

## Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://seu-dominio.vercel.app/api`

## Autenticação

A API usa **JWT Bearer Token** via Supabase Auth para endpoints protegidos.

### Como obter o token

1. Faça login em `/login.html`
2. O token é armazenado em `localStorage` como `token`
3. Use-o no header `Authorization`

### Formato do Header

```
Authorization: Bearer {seu_token_jwt}
```

---

## Endpoints

### 🔓 Públicos (Sem Autenticação)

#### GET /api/carros

Lista todos os carros avaliados, ordenados por data decrescente.

**Request:**
```http
GET /api/carros HTTP/1.1
Host: localhost:3000
```

**Response 200 OK:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "titulo": "Porsche 911 GT3 - O carro dos sonhos",
    "descricao": "Análise completa do icônico Porsche 911 GT3...",
    "marca": "Porsche",
    "modelo": "911 GT3",
    "ano": 2024,
    "preco_estimado": 850000.00,
    "nota_geral": 9,
    "video_url": "https://www.youtube.com/embed/xyz",
    "imagem_url": "https://supabase.co/storage/...",
    "autor_email": "admin@premiumcar.com",
    "data_postagem": "2024-11-14T12:00:00.000Z"
  }
]
```

---

#### GET /api/carros/:id

Obtém detalhes de um carro específico.

**Request:**
```http
GET /api/carros/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3000
```

**Response 200 OK:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Porsche 911 GT3 - O carro dos sonhos",
  "descricao": "Análise completa...",
  "marca": "Porsche",
  "modelo": "911 GT3",
  "ano": 2024,
  "preco_estimado": 850000.00,
  "nota_geral": 9,
  "video_url": "https://www.youtube.com/embed/xyz",
  "imagem_url": "https://...",
  "autor_email": "admin@premiumcar.com",
  "data_postagem": "2024-11-14T12:00:00.000Z"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Carro não encontrado"
}
```

---

#### GET /api/config

Retorna configuração pública do Supabase (usado pelo frontend).

**Request:**
```http
GET /api/config HTTP/1.1
Host: localhost:3000
```

**Response 200 OK:**
```json
{
  "supabaseUrl": "https://seu-projeto.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### GET /api/health

Health check do servidor.

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:3000
```

**Response 200 OK:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-14T12:00:00.000Z",
  "uptime": 12345.67
}
```

---

#### POST /api/contacts

Envia mensagem de contato.

**Request:**
```http
POST /api/contacts HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "mensagem": "Gostaria de saber mais sobre..."
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso"
}
```

---

### 🔐 Protegidos (Requerem Autenticação)

#### POST /api/carros

Cria uma nova avaliação de carro.

**Request:**
```http
POST /api/carros HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "titulo": "Porsche 911 GT3 - O carro dos sonhos",
  "descricao": "Análise completa do icônico Porsche 911 GT3. Este carro oferece performance excepcional com motor boxer de 4.0L que entrega 510 cv de potência pura...",
  "marca": "Porsche",
  "modelo": "911 GT3",
  "ano": 2024,
  "preco_estimado": 850000,
  "nota_geral": 9,
  "video_url": "https://www.youtube.com/embed/xyz",
  "imagem_url": "https://supabase.co/storage/..."
}
```

**Validações:**
- `titulo`: String, mínimo 10 caracteres (obrigatório)
- `descricao`: String, mínimo 100 caracteres (obrigatório)
- `marca`: String, não vazio (obrigatório)
- `modelo`: String, não vazio (obrigatório)
- `ano`: Integer, entre 1900 e 2030 (obrigatório)
- `preco_estimado`: Number, maior ou igual a 0 (obrigatório)
- `nota_geral`: Integer, entre 1 e 10 (obrigatório)
- `video_url`: String, URL válida (opcional)
- `imagem_url`: String, URL válida (opcional)

**Response 201 Created:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Porsche 911 GT3 - O carro dos sonhos",
  "descricao": "Análise completa...",
  "marca": "Porsche",
  "modelo": "911 GT3",
  "ano": 2024,
  "preco_estimado": 850000.00,
  "nota_geral": 9,
  "video_url": "https://www.youtube.com/embed/xyz",
  "imagem_url": "https://...",
  "autor_email": "admin@premiumcar.com",
  "data_postagem": "2024-11-14T12:00:00.000Z"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Dados inválidos",
  "details": [
    "Título deve ter pelo menos 10 caracteres",
    "Descrição deve ter pelo menos 100 caracteres"
  ]
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Token de autenticação ausente ou inválido"
}
```

---

#### PUT /api/carros/:id

Atualiza uma avaliação existente.

**Request:**
```http
PUT /api/carros/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "titulo": "Porsche 911 GT3 - Atualizado",
  "descricao": "Análise atualizada com novas informações...",
  "marca": "Porsche",
  "modelo": "911 GT3",
  "ano": 2024,
  "preco_estimado": 870000,
  "nota_geral": 10,
  "video_url": "https://www.youtube.com/embed/abc",
  "imagem_url": "https://..."
}
```

**Response 200 OK:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Porsche 911 GT3 - Atualizado",
  ...
}
```

**Response 404 Not Found:**
```json
{
  "error": "Carro não encontrado"
}
```

---

#### DELETE /api/carros/:id

Exclui uma avaliação.

**Request:**
```http
DELETE /api/carros/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 204 No Content:**
(Sem corpo de resposta)

**Response 401 Unauthorized:**
```json
{
  "error": "Token inválido ou expirado"
}
```

---

#### POST /api/upload

Faz upload de uma imagem para o Supabase Storage.

**Request:**
```http
POST /api/upload HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "filename": "porsche-911-gt3.jpg",
  "contentType": "image/jpeg",
  "fileData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}
```

**Validações:**
- Formatos aceitos: JPG, PNG, WEBP
- Tamanho máximo: 5MB
- `fileData` deve estar em base64

**Response 200 OK:**
```json
{
  "url": "https://supabase.co/storage/v1/object/public/imagens/1234567890-porsche-911-gt3.jpg"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Formato de arquivo inválido. Apenas JPG, PNG e WEBP são permitidos."
}
```

---

## Códigos de Status HTTP

| Código | Significado | Quando ocorre |
|--------|-------------|---------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 204 | No Content | Exclusão bem-sucedida |
| 400 | Bad Request | Dados inválidos ou faltando |
| 401 | Unauthorized | Token ausente ou inválido |
| 404 | Not Found | Recurso não encontrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro no servidor |

---

## Rate Limiting

A API implementa rate limiting para proteger contra abuso:

- **Limite**: 100 requisições por minuto por IP
- **Window**: 60 segundos
- **Response 429**: Quando o limite é excedido

```json
{
  "error": "Muitas requisições. Tente novamente mais tarde."
}
```

---

## Erros Comuns

### Token Expirado

**Problema:** Token JWT expirou (padrão: 1 hora)

**Solução:** Faça logout e login novamente

**Response:**
```json
{
  "error": "Token inválido ou expirado"
}
```

---

### Dados Inválidos

**Problema:** Campos obrigatórios faltando ou valores fora do padrão

**Response:**
```json
{
  "error": "Dados inválidos",
  "details": [
    "Título deve ter pelo menos 10 caracteres",
    "Nota deve estar entre 1 e 10"
  ]
}
```

---

### CORS Error

**Problema:** Requisição de origem não autorizada

**Solução:** Configurar CORS no `server.js` ou usar proxy

---

## Exemplos de Uso

### JavaScript (Fetch API)

```javascript
// GET - Listar carros
const carros = await fetch('/api/carros')
  .then(res => res.json());

// POST - Criar carro (autenticado)
const token = localStorage.getItem('token');
const novoCarro = await fetch('/api/carros', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    titulo: "Novo Carro",
    descricao: "Descrição longa com mais de 100 caracteres...",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2024,
    preco_estimado: 150000,
    nota_geral: 8,
    video_url: "https://youtube.com/...",
    imagem_url: "https://..."
  })
}).then(res => res.json());

// DELETE - Excluir carro (autenticado)
await fetch(`/api/carros/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL

```bash
# GET - Listar carros
curl -X GET http://localhost:3000/api/carros

# POST - Criar carro (autenticado)
curl -X POST http://localhost:3000/api/carros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "titulo": "Novo Carro",
    "descricao": "Descrição longa...",
    "marca": "Toyota",
    "modelo": "Corolla",
    "ano": 2024,
    "preco_estimado": 150000,
    "nota_geral": 8
  }'

# DELETE - Excluir carro (autenticado)
curl -X DELETE http://localhost:3000/api/carros/ID_DO_CARRO \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Suporte

Para reportar bugs ou solicitar features, abra uma issue no GitHub:  
https://github.com/KallebyX/premium-car-site/issues

---

**Última atualização:** Novembro 2024
