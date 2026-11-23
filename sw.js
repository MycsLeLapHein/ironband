/* =========================================================================
   KetoFit — Service Worker
   Pré-cache de l’application + cache des GIFs consultés (mode hors-ligne)
   Pour publier une mise à jour : incrémente CACHE_VERSION.
   ========================================================================= */

const CACHE_VERSION = 'ketofit-v1.1.0';
const RUNTIME_CACHE = 'ketofit-runtime';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/app.css',
  './js/data.js',
  './js/app.js',
  './manifest.json',
  './icons/favicon.svg',
  './icons/ketofit-mark.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(PRECACHE_URLS.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: 'reload' }));
      } catch (err) {
        /* un fichier manquant ne doit pas casser l’installation */
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key !== CACHE_VERSION && key !== RUNTIME_CACHE) return caches.delete(key);
      return Promise.resolve(false);
    }));
    await self.clients.claim();
  })());
});

function isCacheable(response) {
  return response && (response.ok || response.type === 'opaque' || response.type === 'cors');
}

async function networkFirstPage(request) {
  try {
    const fresh = await fetch(request);
    if (isCacheable(fresh)) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const shell = await caches.match('./index.html');
    if (shell) return shell;
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>KetoFit hors-ligne</title>' +
      '<body style="background:#0f1115;color:#f2f4f8;font-family:system-ui;padding:32px">' +
      '<h1>KetoFit</h1><p>Cette page n’est pas encore disponible hors-ligne.</p>' +
      '<p>Reconnecte-toi une fois, puis réessaie.</p></body>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await network) || Response.error();
}

async function imageCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation : réseau d’abord, puis coquille en cache (hors-ligne)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  // Ressources de l’application (même origine)
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // GIFs et images distantes (dataset des exercices) : cache d’abord
  if (request.destination === 'image') {
    event.respondWith(imageCacheFirst(request));
  }
});

// Permet à la page de déclencher une mise à jour immédiate si besoin
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
