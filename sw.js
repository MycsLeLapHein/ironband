/* =========================================================================
   IronBand — Service Worker
   - pré-cache de l’application
   - cache dédié et durable des GIFs : ironband-gifs-v1
   - GIFs servis en cache-first (entraînement sans réseau)
   Pour publier une mise à jour : incrémente CACHE_VERSION.
   ========================================================================= */

const CACHE_VERSION = 'ironband-v1.2.0';
const RUNTIME_CACHE = 'ironband-runtime';
const GIF_CACHE = 'ironband-gifs-v1';
const GIF_HOST = 'raw.githubusercontent.com';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/app.css',
  './js/data.js',
  './js/app.js',
  './manifest.json',
  './icons/favicon.svg',
  './icons/ironband-mark.png',
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
      if ([CACHE_VERSION, RUNTIME_CACHE, GIF_CACHE].includes(key)) return Promise.resolve(false);
      // Supprime les anciens caches (KetoFit, Kettleband, anciennes versions…)
      return caches.delete(key);
    }));
    await self.clients.claim();
  })());
});

function isCacheable(response) {
  return response && (response.ok || response.type === 'opaque' || response.type === 'cors');
}

function isGifRequest(request, url) {
  if (url.hostname === GIF_HOST) return true;
  if (/\.gif($|\?)/i.test(url.pathname)) return true;
  return false;
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
      '<!doctype html><meta charset="utf-8"><title>IronBand hors-ligne</title>' +
      '<body style="background:#0f1115;color:#f2f4f8;font-family:system-ui;padding:32px">' +
      '<h1>IronBand</h1><p>Cette page n’est pas encore disponible hors-ligne.</p>' +
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

/* Cache-first dédié aux GIFs : une fois vu (ou pré-téléchargé), toujours dispo */
async function gifCacheFirst(request) {
  const cache = await caches.open(GIF_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (isCacheable(response)) await cache.put(request, response.clone());
    return response;
  } catch (err) {
    return Response.error();
  }
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

  // GIFs (dataset GitHub) : cache dédié, cache-first
  if (isGifRequest(request, url)) {
    event.respondWith(gifCacheFirst(request));
    return;
  }

  // Ressources de l’application (même origine)
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Autres images distantes : cache d’abord (cache runtime)
  if (request.destination === 'image') {
    event.respondWith(imageCacheFirst(request));
  }
});

// Permet à la page de déclencher une mise à jour immédiate si besoin
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
