# Contribuindo para o Premium Car

Obrigado por considerar contribuir para o Premium Car! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Melhorias](#sugerir-melhorias)
- [Processo de Pull Request](#processo-de-pull-request)
- [Guia de Estilo](#guia-de-estilo)
- [Estrutura de Commits](#estrutura-de-commits)

## 🤝 Código de Conduta

Este projeto segue o [Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você concorda em seguir este código de conduta.

### Comportamento Esperado

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista e experiências diferentes
- Aceite críticas construtivas graciosamente
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🐛 Reportar Bugs

Bugs são rastreados como [GitHub Issues](https://github.com/KallebyX/premium-car-site/issues).

### Antes de Reportar

- Verifique se o bug já não foi reportado
- Determine qual repositório o bug pertence
- Colete informações sobre o bug

### Como Reportar

Use o template abaixo:

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Como Reproduzir**
Passos para reproduzir:
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

**Comportamento Esperado**
Uma descrição clara do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente:**
- OS: [ex. Windows 10]
- Browser: [ex. Chrome 96]
- Versão do Node: [ex. 16.13.0]

**Contexto Adicional**
Adicione qualquer outro contexto sobre o problema aqui.
```

## 💡 Sugerir Melhorias

Melhorias também são rastreadas como [GitHub Issues](https://github.com/KallebyX/premium-car-site/issues).

### Template para Sugestões

```markdown
**Sua sugestão está relacionada a um problema? Descreva.**
Uma descrição clara do problema. Ex: Sempre fico frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Uma descrição clara de quaisquer soluções ou recursos alternativos que você considerou.

**Contexto adicional**
Adicione qualquer outro contexto ou screenshots sobre a sugestão aqui.
```

## 🔄 Processo de Pull Request

1. **Fork o Repositório**
   ```bash
   git clone https://github.com/SEU-USUARIO/premium-car-site.git
   cd premium-car-site
   ```

2. **Crie uma Branch**
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```

3. **Faça suas Alterações**
   - Escreva código limpo e comentado
   - Siga o guia de estilo
   - Teste suas alterações

4. **Commit suas Mudanças**
   ```bash
   git add .
   git commit -m "feat: Adiciona nova funcionalidade X"
   ```

5. **Push para o GitHub**
   ```bash
   git push origin feature/MinhaNovaFeature
   ```

6. **Abra um Pull Request**
   - Vá para o repositório original
   - Clique em "New Pull Request"
   - Selecione sua branch
   - Preencha o template de PR

### Template de Pull Request

```markdown
## Descrição
Descreva suas mudanças aqui.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (correção ou feature que causaria quebra de funcionalidade existente)
- [ ] Atualização de documentação

## Como Foi Testado?
Descreva os testes que você executou.

## Checklist
- [ ] Meu código segue o guia de estilo do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei meu código, especialmente em áreas difíceis
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Testei em diferentes navegadores
- [ ] Testei em dispositivos móveis

## Screenshots (se aplicável)
Adicione screenshots para demonstrar as mudanças.
```

## 📝 Guia de Estilo

### JavaScript

- Use **ES6+** quando possível
- Use **camelCase** para variáveis e funções
- Use **PascalCase** para classes
- Use **UPPER_CASE** para constantes
- Indentação: **2 espaços**
- Aspas: **simples** para strings
- Ponto e vírgula: **obrigatório**

```javascript
// ✅ Bom
const minhaVariavel = 'valor';
function minhaFuncao() {
  return minhaVariavel;
}

// ❌ Ruim
var minha_variavel = "valor"
function MinhaFuncao() 
{
  return minha_variavel
}
```

### HTML

- Use **indentação de 2 espaços**
- Use **tags semânticas** (header, nav, main, footer, etc.)
- Sempre feche tags
- Use **alt** em imagens

```html
<!-- ✅ Bom -->
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<!-- ❌ Ruim -->
<div id="header">
<div id="nav">
<ul>
<li><a href="/">Home</a>
</ul>
</div>
</div>
```

### CSS

- Use **kebab-case** para classes
- Organize propriedades alfabeticamente
- Use **variáveis CSS** quando aplicável
- Prefira **classes** em vez de IDs

```css
/* ✅ Bom */
.meu-componente {
  background-color: var(--primary-color);
  border-radius: 8px;
  padding: 1rem;
}

/* ❌ Ruim */
#MeuComponente {
  padding: 1rem;
  background-color: red;
  border-radius: 8px;
}
```

## 📦 Estrutura de Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc (sem mudança de código)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição ou correção de testes
- `chore`: Atualização de build, dependências, etc

### Exemplos

```bash
# Nova feature
git commit -m "feat(admin): Adiciona busca por marca no painel"

# Correção de bug
git commit -m "fix(login): Corrige erro de redirecionamento após login"

# Documentação
git commit -m "docs(readme): Atualiza instruções de instalação"

# Refatoração
git commit -m "refactor(api): Simplifica lógica de validação"

# Performance
git commit -m "perf(images): Adiciona lazy loading nas imagens"
```

## 🧪 Testes

Antes de submeter um PR, teste:

1. **Funcionalidade Básica**
   - [ ] Página inicial carrega
   - [ ] Navegação funciona
   - [ ] Login funciona
   - [ ] CRUD funciona

2. **Responsividade**
   - [ ] Desktop (1920x1080)
   - [ ] Tablet (768x1024)
   - [ ] Mobile (375x667)

3. **Navegadores**
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

4. **Performance**
   - [ ] Lighthouse score > 90
   - [ ] Sem erros no console
   - [ ] Tempo de carregamento < 3s

## 📚 Recursos Úteis

- [Documentação do Express](https://expressjs.com/)
- [Documentação do Supabase](https://supabase.com/docs)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [JavaScript MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

## ❓ Dúvidas?

Se tiver dúvidas, você pode:

1. Abrir uma [Discussion](https://github.com/KallebyX/premium-car-site/discussions)
2. Enviar email para: contato@premiumcar.com
3. Comentar em issues existentes

## 🙏 Agradecimentos

Obrigado por contribuir para tornar o Premium Car melhor!

---

**Última atualização:** Novembro 2024
