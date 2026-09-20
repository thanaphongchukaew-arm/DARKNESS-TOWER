const CACHE_NAME = 'darkness-tower-v7';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/reset.css',
  './css/theme.css',
  './css/layout.css',
  './css/components.css',
  './css/menu.css',
  './css/battle.css',
  './dist/game.min.js',
  './fonts/ChakraPetch-300-latin-ext.woff2',
  './fonts/ChakraPetch-300-latin.woff2',
  './fonts/ChakraPetch-300-thai.woff2',
  './fonts/ChakraPetch-300-vietnamese.woff2',
  './fonts/ChakraPetch-400-latin-ext.woff2',
  './fonts/ChakraPetch-400-latin.woff2',
  './fonts/ChakraPetch-400-thai.woff2',
  './fonts/ChakraPetch-400-vietnamese.woff2',
  './fonts/ChakraPetch-500-latin-ext.woff2',
  './fonts/ChakraPetch-500-latin.woff2',
  './fonts/ChakraPetch-500-thai.woff2',
  './fonts/ChakraPetch-500-vietnamese.woff2',
  './fonts/ChakraPetch-500i-latin-ext.woff2',
  './fonts/ChakraPetch-500i-latin.woff2',
  './fonts/ChakraPetch-500i-thai.woff2',
  './fonts/ChakraPetch-500i-vietnamese.woff2',
  './fonts/ChakraPetch-600-latin-ext.woff2',
  './fonts/ChakraPetch-600-latin.woff2',
  './fonts/ChakraPetch-600-thai.woff2',
  './fonts/ChakraPetch-600-vietnamese.woff2',
  './fonts/ChakraPetch-700-latin-ext.woff2',
  './fonts/ChakraPetch-700-latin.woff2',
  './fonts/ChakraPetch-700-thai.woff2',
  './fonts/ChakraPetch-700-vietnamese.woff2',
  './fonts/PressStart2P-400-cyrillic-ext.woff2',
  './fonts/PressStart2P-400-cyrillic.woff2',
  './fonts/PressStart2P-400-greek.woff2',
  './fonts/PressStart2P-400-latin-ext.woff2',
  './fonts/PressStart2P-400-latin.woff2',
  './fonts/fonts.css',
  './backgrounds/menu-bg.jpg',
  './backgrounds/story-intro-bg.png',
  './backgrounds/story-ending-bg.png',
  './icons/android-chrome-192x192.png',
  './icons/android-chrome-512x512.png',
  './icons/favicon-16x16.png',
  './icons/favicon-32x32.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: serve the cached asset instantly (works offline),
// then refresh the cache in the background so the next load picks up updates.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)));
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || networkFetch;
    })
  );
});
