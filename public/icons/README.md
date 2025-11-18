# Premium Car - PWA Icons

Este diretório contém todos os ícones necessários para o Progressive Web App (PWA) do Premium Car.

## 📁 Estrutura de Arquivos

### 🎨 Arquivos Fonte (SVG)
- `icon-master.svg` - Ícone principal do aplicativo (usado como fonte para gerar PNGs)
- `favicon.svg` - Ícone simplificado para favicons
- `safari-pinned-tab.svg` - Ícone monocromático para Safari
- `shortcut-*.svg` - Ícones para atalhos do PWA
- `badge-72x72.svg` - Badge para notificações
- `action-*.svg` - Ícones para ações de notificações

### 🖼️ Ícones Gerados (PNG)

#### Ícones do Aplicativo
- `icon-72x72.png` - 72×72px
- `icon-96x96.png` - 96×96px
- `icon-128x128.png` - 128×128px
- `icon-144x144.png` - 144×144px
- `icon-152x152.png` - 152×152px
- `icon-192x192.png` - 192×192px (mínimo para PWA)
- `icon-384x384.png` - 384×384px
- `icon-512x512.png` - 512×512px (recomendado para PWA)

#### Favicons
- `favicon-16x16.png` - 16×16px
- `favicon-32x32.png` - 32×32px
- `favicon.ico` - Ícone multi-tamanho para navegadores

#### Ícones Apple
- `apple-touch-icon.png` - 180×180px (para iOS)

#### Ícones de Atalhos
- `shortcut-evaluations.png` - Atalho para avaliações
- `shortcut-about.png` - Atalho para sobre nós
- `shortcut-contact.png` - Atalho para contato

#### Ícones de Notificações
- `badge-72x72.png` - Badge de notificações
- `action-view.png` - Botão "Ver" em notificações
- `action-close.png` - Botão "Fechar" em notificações

## 🔧 Como Gerar os Ícones

Os ícones PNG são gerados automaticamente a partir dos arquivos SVG usando o script `generate-icons.js`.

### Comando:
```bash
npm run generate-icons
```

### Quando Regenerar:
- Após modificar qualquer arquivo SVG fonte
- Ao adicionar novos tamanhos de ícone
- Ao criar novos atalhos ou ações

## 🎨 Personalizando os Ícones

### 1. Modificar o Ícone Principal
Edite o arquivo `icon-master.svg` com seu editor SVG favorito (Figma, Inkscape, Adobe Illustrator, etc.).

### 2. Manter Proporções
- Use um viewBox de 512×512 para o ícone principal
- Mantenha elementos centralizados
- Deixe margem de segurança de ~10% nas bordas

### 3. Cores e Gradientes
O ícone atual usa:
- **Gradiente vermelho**: `#dc3545` → `#a02834` (cor primária da marca)
- **Branco**: `#ffffff` para contraste
- **Cinzas**: `#212529`, `#6c757d` para detalhes

### 4. Regenerar após Mudanças
Sempre execute `npm run generate-icons` após modificar SVGs.

## 📱 Onde os Ícones são Usados

### Manifest.json
```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### HTML (head)
```html
<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">

<!-- Safari Pinned Tab -->
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#dc3545">
```

### Service Worker
Os ícones são automaticamente cacheados para uso offline pelo service worker.

## ✅ Checklist de Qualidade

Ao criar/modificar ícones, verifique:

- [ ] SVG está otimizado (viewBox correto, sem elementos desnecessários)
- [ ] Ícone é visível em fundos claros e escuros
- [ ] Detalhes são visíveis em tamanhos pequenos (16×16, 32×32)
- [ ] Cores seguem a identidade visual da marca
- [ ] PNGs foram regenerados após mudanças
- [ ] Manifest.json está atualizado
- [ ] Ícones testados em diferentes dispositivos

## 🔍 Testando os Ícones

### Chrome DevTools
1. Abra DevTools (F12)
2. Vá em **Application** > **Manifest**
3. Visualize todos os ícones do PWA

### Lighthouse
```bash
npm install -g lighthouse
lighthouse https://premiumcar.com --view
```

Verifique a seção **PWA** para validar ícones.

### Dispositivos Reais
- iOS Safari: Adicione à tela inicial e verifique o ícone
- Android Chrome: Instale o PWA e verifique o ícone
- Desktop: Instale como app e verifique ícones do sistema

## 📚 Referências

- [PWA Icons Guidelines](https://web.dev/add-manifest/#icons)
- [Apple Touch Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Favicon Best Practices](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)
- [Web App Manifest Spec](https://w3c.github.io/manifest/)

## 🛠️ Dependências

- **sharp** - Biblioteca Node.js para processamento de imagens
  - Instalação: `npm install --save-dev sharp`
  - Documentação: https://sharp.pixelplumbing.com/

---

**Premium Car** - Avaliações Automotivas
© 2025 - Todos os direitos reservados
