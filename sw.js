// Course Materials Hub — Service Worker
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'course-hub-' + CACHE_VERSION;

// Core app shell — always available offline
const CORE_ASSETS = [
  './',
  './index.html',
  './course-hub.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old cache versions and take control of open tabs immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('course-hub-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
//  - HTML / navigation requests (the app shell itself): network-first, so
//    everyone gets the latest deployed version immediately; falls back to
//    cache only when offline. This fixes "works on phone, stale on laptop".
//  - Other same-origin assets (icons, manifest): cache-first (rarely change).
//  - Third-party assets (CDN scripts): stale-while-revalidate.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html') ||
                 url.pathname.endsWith('.html');

  if (isSameOrigin && isHTML) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return networkRes;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./course-hub.html')))
    );
  } else if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((networkRes) => {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            return networkRes;
          })
          .catch(() => caches.match('./course-hub.html'));
      })
    );
  } else {
    // Third-party assets (Google Fonts, cdnjs, etc.)
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((networkRes) => {
              cache.put(req, networkRes.clone());
              return networkRes;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
  }
});
