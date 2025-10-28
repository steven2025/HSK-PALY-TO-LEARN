// sw.js - minimal offline cache for page + audio on GitHub Pages
const CACHE = 'hsk-audio-v1';
const ASSETS = [
  './',
  './index.html',
  './audio/bgm.mp3',
  './audio/水墨.MP3' // 若你改名/改扩展名，记得同步这里和 index.html
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // 音频：缓存优先（离线秒播）
  if (req.url.endsWith('.mp3') || req.url.endsWith('.MP3') ||
      req.destination === 'audio') {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }
  // 其它资源：网络优先，失败回退缓存（保证离线可用）
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req))
  );
});
