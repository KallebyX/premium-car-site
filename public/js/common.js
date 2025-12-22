/**
 * PREMIUM CAR - Common JavaScript Utilities
 * Módulos reutilizáveis para todo o site
 */

// ============================================
// MÓDULO DE AUTENTICAÇÃO
// ============================================
const Auth = {
  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Obtém o token do localStorage
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Salva o token no localStorage
   * @param {string} token
   */
  setToken(token) {
    localStorage.setItem('token', token);
  },

  /**
   * Remove o token e faz logout
   */
  logout() {
    if (confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    }
  },

  /**
   * Atualiza UI baseado no estado de autenticação
   */
  updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (this.isAuthenticated()) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (adminBtn) adminBtn.style.display = 'inline-flex';
      if (logoutBtn) {
        logoutBtn.style.display = 'inline-flex';
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (adminBtn) adminBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }
};

// ============================================
// MÓDULO DE CARREGAMENTO DE HEADER/FOOTER
// ============================================
const Layout = {
  /**
   * Carrega header e footer compartilhados
   */
  async loadHeaderFooter() {
    try {
      const response = await fetch('/base.html');
      const html = await response.text();

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const header = tempDiv.querySelector('header');
      const footer = tempDiv.querySelector('footer');

      const headerContainer = document.getElementById('injected-header');
      const footerContainer = document.getElementById('injected-footer');

      if (header && headerContainer) {
        headerContainer.appendChild(header);
      }

      if (footer && footerContainer) {
        footerContainer.appendChild(footer);
      }

      // Atualiza UI de autenticação após carregar header
      Auth.updateAuthUI();

      // Inicializa menu mobile
      this.initMobileMenu();

    } catch (error) {
      console.error('Erro ao carregar header/footer:', error);
    }
  },

  /**
   * Inicializa comportamento do menu mobile
   */
  initMobileMenu() {
    const offcanvas = document.querySelector('.offcanvas');
    if (!offcanvas) return;

    // Fecha menu ao clicar em link
    const menuLinks = offcanvas.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
        if (bsOffcanvas) {
          bsOffcanvas.hide();
        }
      });
    });
  }
};

// ============================================
// MÓDULO DE FORMATAÇÃO
// ============================================
const Format = {
  /**
   * Formata valor para moeda brasileira
   * @param {number} value
   * @returns {string}
   */
  currency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Formata número com separadores
   * @param {number} value
   * @returns {string}
   */
  number(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
  },

  /**
   * Formata data para padrão brasileiro
   * @param {string|Date} date
   * @returns {string}
   */
  date(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  },

  /**
   * Formata data e hora
   * @param {string|Date} date
   * @returns {string}
   */
  datetime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  }
};

// ============================================
// MÓDULO DE NOTIFICAÇÕES TOAST
// ============================================
const Toast = {
  container: null,

  /**
   * Inicializa container de toasts
   */
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
      `;
      document.body.appendChild(this.container);
    }
  },

  /**
   * Mostra notificação toast
   * @param {string} message - Mensagem a exibir
   * @param {string} type - success|error|warning|info
   * @param {number} duration - Duração em ms (padrão: 5000)
   */
  show(message, type = 'info', duration = 5000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const colors = {
      success: '#198754',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#0dcaf0'
    };

    toast.style.cssText = `
      background: white;
      border-left: 4px solid ${colors[type]};
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      animation: slideInRight 0.3s ease;
      font-size: 14px;
      color: #212529;
    `;

    toast.innerHTML = `
      <span style="
        width: 24px;
        height: 24px;
        background: ${colors[type]};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
      ">${icons[type]}</span>
      <span style="flex: 1;">${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        font-size: 20px;
        color: #6c757d;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      " aria-label="Fechar notificação">×</button>
    `;

    this.container.appendChild(toast);

    // Remove automaticamente após duração
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

// Adiciona animações CSS para toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  @media (max-width: 576px) {
    #toast-container {
      left: 10px !important;
      right: 10px !important;
      max-width: none !important;
    }
    .toast-notification {
      min-width: auto !important;
    }
  }
`;
document.head.appendChild(toastStyles);

// ============================================
// MÓDULO DE LOADING
// ============================================
const Loading = {
  overlay: null,

  /**
   * Mostra overlay de loading
   * @param {string} message - Mensagem opcional
   */
  show(message = 'Carregando...') {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'loading-overlay';
      this.overlay.setAttribute('role', 'alert');
      this.overlay.setAttribute('aria-busy', 'true');
      this.overlay.setAttribute('aria-live', 'polite');
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 9998;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
      `;
      this.overlay.innerHTML = `
        <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p id="loading-message" style="color: white; font-size: 18px; font-weight: 600; margin: 0;"></p>
      `;
      document.body.appendChild(this.overlay);
    }

    const messageEl = this.overlay.querySelector('#loading-message');
    if (messageEl) messageEl.textContent = message;
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  /**
   * Esconde overlay de loading
   */
  hide() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
};

// ============================================
// MÓDULO DE VALIDAÇÃO DE FORMULÁRIOS
// ============================================
const Validation = {
  /**
   * Valida email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Valida telefone brasileiro
   * @param {string} phone
   * @returns {boolean}
   */
  isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },

  /**
   * Valida campo obrigatório
   * @param {string} value
   * @returns {boolean}
   */
  isRequired(value) {
    return value && value.trim().length > 0;
  },

  /**
   * Valida tamanho mínimo
   * @param {string} value
   * @param {number} min
   * @returns {boolean}
   */
  minLength(value, min) {
    return value && value.length >= min;
  },

  /**
   * Valida tamanho máximo
   * @param {string} value
   * @param {number} max
   * @returns {boolean}
   */
  maxLength(value, max) {
    return value && value.length <= max;
  },

  /**
   * Mostra erro de validação em campo
   * @param {HTMLElement} input
   * @param {string} message
   */
  showError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');

    let feedback = input.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      feedback.setAttribute('role', 'alert');
      input.parentNode.insertBefore(feedback, input.nextSibling);
    }
    feedback.textContent = message;
    feedback.style.display = 'block';
  },

  /**
   * Mostra sucesso de validação em campo
   * @param {HTMLElement} input
   */
  showSuccess(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');

    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.style.display = 'none';
    }
  },

  /**
   * Limpa estado de validação
   * @param {HTMLElement} input
   */
  clearValidation(input) {
    input.classList.remove('is-invalid', 'is-valid');
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
      feedback.style.display = 'none';
    }
  }
};

// ============================================
// MÓDULO DE UTILITÁRIOS
// ============================================
const Utils = {
  /**
   * Debounce function
   * @param {Function} func
   * @param {number} wait
   * @returns {Function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Scroll suave para elemento
   * @param {string|HTMLElement} target
   */
  scrollTo(target) {
    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  },

  /**
   * Copia texto para clipboard
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      Toast.success('Copiado para área de transferência!');
      return true;
    } catch (error) {
      Toast.error('Erro ao copiar texto');
      return false;
    }
  },

  /**
   * Gera ID único
   * @returns {string}
   */
  generateId() {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Sanitiza HTML para prevenir XSS
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// ============================================
// BOTÃO VOLTAR AO TOPO
// ============================================
const BackToTop = {
  button: null,

  /**
   * Inicializa botão voltar ao topo
   */
  init() {
    // Cria botão
    this.button = document.createElement('button');
    this.button.id = 'back-to-top';
    this.button.setAttribute('aria-label', 'Voltar ao topo');
    this.button.setAttribute('title', 'Voltar ao topo');
    this.button.innerHTML = '<i class="bi bi-arrow-up"></i>';
    this.button.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: var(--color-primary-600);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(this.button);

    // Eventos
    window.addEventListener('scroll', () => this.toggleVisibility());
    this.button.addEventListener('click', () => this.scrollToTop());
  },

  /**
   * Mostra/esconde botão baseado no scroll
   */
  toggleVisibility() {
    if (window.pageYOffset > 300) {
      this.button.style.opacity = '1';
      this.button.style.visibility = 'visible';
    } else {
      this.button.style.opacity = '0';
      this.button.style.visibility = 'hidden';
    }
  },

  /**
   * Scroll suave para o topo
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Carrega header e footer
  Layout.loadHeaderFooter();

  // Inicializa botão voltar ao topo
  BackToTop.init();

  // Inicializa sistema de favoritos
  Favorites.init();

  // Adiciona skip link se não existir
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Pular para o conteúdo principal';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Adiciona ID ao main content se não existir
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main-content';
    main.setAttribute('tabindex', '-1');
  }
});

// ============================================
// MÓDULO DE FAVORITOS
// ============================================
const Favorites = {
  STORAGE_KEY: 'premium_car_favorites',

  /**
   * Obtém todos os favoritos do localStorage
   * @returns {Array<string>} Array de IDs dos carros favoritos
   */
  getAll() {
    const favorites = localStorage.getItem(this.STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  },

  /**
   * Adiciona um carro aos favoritos
   * @param {string|number} carId - ID do carro
   * @returns {boolean} True se adicionado, false se já existia
   */
  add(carId) {
    const favorites = this.getAll();
    const id = String(carId);

    if (favorites.includes(id)) {
      return false;
    }

    favorites.push(id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    this.updateCounter();

    // Dispatch custom event para outras partes da página reagirem
    window.dispatchEvent(new CustomEvent('favoritesChanged', {
      detail: { action: 'add', carId: id, total: favorites.length }
    }));

    return true;
  },

  /**
   * Remove um carro dos favoritos
   * @param {string|number} carId - ID do carro
   * @returns {boolean} True se removido, false se não existia
   */
  remove(carId) {
    const favorites = this.getAll();
    const id = String(carId);
    const index = favorites.indexOf(id);

    if (index === -1) {
      return false;
    }

    favorites.splice(index, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    this.updateCounter();

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('favoritesChanged', {
      detail: { action: 'remove', carId: id, total: favorites.length }
    }));

    return true;
  },

  /**
   * Alterna o status de favorito de um carro
   * @param {string|number} carId - ID do carro
   * @returns {boolean} True se agora é favorito, false se foi removido
   */
  toggle(carId) {
    if (this.isFavorite(carId)) {
      this.remove(carId);
      return false;
    } else {
      this.add(carId);
      return true;
    }
  },

  /**
   * Verifica se um carro está nos favoritos
   * @param {string|number} carId - ID do carro
   * @returns {boolean}
   */
  isFavorite(carId) {
    const favorites = this.getAll();
    return favorites.includes(String(carId));
  },

  /**
   * Obtém a contagem de favoritos
   * @returns {number}
   */
  getCount() {
    return this.getAll().length;
  },

  /**
   * Limpa todos os favoritos
   */
  clear() {
    if (confirm('Tem certeza que deseja remover todos os favoritos?')) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.updateCounter();

      window.dispatchEvent(new CustomEvent('favoritesChanged', {
        detail: { action: 'clear', total: 0 }
      }));

      Toast.success('Todos os favoritos foram removidos');
    }
  },

  /**
   * Atualiza o contador de favoritos na UI
   */
  updateCounter() {
    const count = this.getCount();
    const counters = document.querySelectorAll('.favorites-counter');

    counters.forEach(counter => {
      counter.textContent = count;

      // Mostra/esconde badge baseado na contagem
      if (count > 0) {
        counter.style.display = 'flex';
      } else {
        counter.style.display = 'none';
      }
    });
  },

  /**
   * Inicializa o sistema de favoritos
   * - Atualiza contadores
   * - Adiciona event listeners
   */
  init() {
    // Atualiza contadores ao carregar
    this.updateCounter();

    // Atualiza status dos botões de favoritos na página
    this.updateFavoriteButtons();

    // Escuta mudanças em outras abas
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.updateCounter();
        this.updateFavoriteButtons();
      }
    });
  },

  /**
   * Atualiza o estado visual dos botões de favoritos
   */
  updateFavoriteButtons() {
    const buttons = document.querySelectorAll('[data-favorite-id]');

    buttons.forEach(button => {
      const carId = button.getAttribute('data-favorite-id');
      const isFav = this.isFavorite(carId);

      if (isFav) {
        button.classList.add('active');
        button.querySelector('i')?.classList.replace('bi-heart', 'bi-heart-fill');
        button.setAttribute('aria-label', 'Remover dos favoritos');
      } else {
        button.classList.remove('active');
        button.querySelector('i')?.classList.replace('bi-heart-fill', 'bi-heart');
        button.setAttribute('aria-label', 'Adicionar aos favoritos');
      }
    });
  },

  /**
   * Handler para clique em botão de favorito
   * @param {string|number} carId - ID do carro
   * @param {HTMLElement} button - Elemento do botão (opcional)
   */
  handleToggle(carId, button = null) {
    const isFavorite = this.toggle(carId);

    // Atualiza o botão específico se fornecido
    if (button) {
      if (isFavorite) {
        button.classList.add('active');
        button.querySelector('i')?.classList.replace('bi-heart', 'bi-heart-fill');
        button.setAttribute('aria-label', 'Remover dos favoritos');
      } else {
        button.classList.remove('active');
        button.querySelector('i')?.classList.replace('bi-heart-fill', 'bi-heart');
        button.setAttribute('aria-label', 'Adicionar aos favoritos');
      }
    } else {
      // Atualiza todos os botões do mesmo carro
      this.updateFavoriteButtons();
    }

    // Mostra toast
    if (isFavorite) {
      Toast.success('Carro adicionado aos favoritos!');
    } else {
      Toast.info('Carro removido dos favoritos');
    }
  }
};

// ============================================
// REGISTRO DO SERVICE WORKER (PWA)
// ============================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);

        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              Toast.info('Nova versão disponível! Recarregue a página para atualizar.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] Erro ao registrar Service Worker:', error);
      });
  });
}

// Exporta módulos para uso global
window.Auth = Auth;
window.Layout = Layout;
window.Format = Format;
window.Toast = Toast;
window.Loading = Loading;
window.Validation = Validation;
window.Utils = Utils;
window.BackToTop = BackToTop;
window.Favorites = Favorites;
