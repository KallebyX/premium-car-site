/**
 * Premium Car - Service Worker
 * PWA com estratégia de cache offline-first
 */

const CACHE_NAME = 'premium-car-v1';
const OFFLINE_URL = '/offline.html';

// Arquivos para cache inicial
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/sobre-nos.html',
  '/parcerias.html',
  '/fale-conosco.html',
  '/css/design-tokens.css',
  '/css/global.css',
  '/js/common.js',
  '/manifest.json',
  OFFLINE_URL
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interceptar requisições (estratégia Network First com Fallback)
self.addEventListener('fetch', (event) => {
  // Apenas interceptar requests GET
  if (event.request.method !== 'GET') return;

  // Ignorar requests para domínios externos (CDNs, APIs)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar a resposta antes de cachear
        const responseClone = response.clone();

        // Adicionar ao cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Se falhar, tentar buscar do cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Se não encontrar no cache e for navegação, mostrar página offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }

            // Retornar erro para outros tipos de requests
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background Sync (para futuras features)
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'sync-newsletter') {
    event.waitUntil(syncNewsletter());
  }
});

// Push Notifications (para futuras features)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Nova avaliação disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'premium-car-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Ver Agora',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Premium Car', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper: Sync Newsletter
async function syncNewsletter() {
  // Implementação futura para sincronizar inscrições de newsletter offline
  console.log('[ServiceWorker] Syncing newsletter subscriptions...');
}

// Message Handler (comunicação com páginas)
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload;
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(urlsToCache))
    );
  }
});
