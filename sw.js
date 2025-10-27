
// Service Worker for HSK Game (Offline + Update) — v2025.10.28-pwa1
const CACHE_VERSION = 'v2025.10.28-pwa1';
const PRECACHE = 'precache-' + CACHE_VERSION;
const RUNTIME = 'runtime-' + CACHE_VERSION;

// Adjust these URLs if you rename files
const PRECACHE_URLS = [
  './',
  './HSK_word_match_Game_V1_PWA.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-180.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // activate new SW immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => ![PRECACHE, RUNTIME].includes(k)).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Basic offline strategy:
// - Navigations: serve cached HTML (offline-first), fallback to network
// - Same-origin assets: stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET
  if (req.method !== 'GET') return;

  // HTML navigations
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(PRECACHE);
      const cached = await cache.match('./HSK_word_match_Game_V1_PWA.html') || await cache.match('./');
      try {
        const fresh = await fetch(req);
        // Update cache asynchronously (best-effort)
        cache.put('./HSK_word_match_Game_V1_PWA.html', fresh.clone());
        return fresh;
      } catch (e) {
        return cached || new Response('<h1>离线状态</h1><p>当前无法连接网络，但您仍可继续游玩已缓存的页面。</p>', {headers: {'Content-Type': 'text/html; charset=utf-8'}});
      }
    })());
    return;
  }

  // Same-origin assets: stale-while-revalidate
  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(req);
      const networkFetch = fetch(req).then((res) => {
        cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return cached || (await networkFetch) || Response.error();
    })());
  }
});

// Listen for client messages (e.g., to skip waiting)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
