// Service Worker for HSK Game (Offline + Update) — v2025.10.28-pwa3
const CACHE_VERSION = 'v2025.10.28-pwa3';
const PRECACHE = 'precache-' + CACHE_VERSION;
const RUNTIME = 'runtime-' + CACHE_VERSION;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-180.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => ![PRECACHE, RUNTIME].includes(k)).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(PRECACHE);
      const cached = await cache.match('./index.html') || await cache.match('./');
      try {
        const fresh = await fetch(req);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return cached || new Response('<h1>离线状态</h1><p>已使用本地缓存为您提供页面。</p>', {headers: {'Content-Type': 'text/html; charset=utf-8'}});
      }
    })());
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(req);
      const networkFetch = fetch(req).then((res) => { cache.put(req, res.clone()); return res; }).catch(() => null);
      return cached || (await networkFetch) || Response.error();
    })());
  }
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
