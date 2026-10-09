/**
 * Mercy's Blog – Service Worker
 * Basic offline caching for PWA
 */

const CACHE_NAME = 'mercys-blog-v9';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/post-page.html',
  '/profile-page.html',
  '/admin-login.html',
  '/styles/main.css',
  '/styles/post-page.css',
  '/styles/profile-page.css',
  '/styles/admin-login.css',
  '/scripts/jquery.js',
  '/scripts/api.js',
  '/scripts/main.js',
  '/scripts/post-page.js',
  '/scripts/profile-page.js',
  '/scripts/admin-login.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/images/featured.jpg',
  '/assets/images/avatar.jpg'
];

// Install – cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate – clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch – network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't cache API requests – always go to network
  if (url.pathname.startsWith('/api') || url.hostname.includes('onrender.com') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ success: false, message: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Static assets: cache-first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Only cache successful GET responses
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
