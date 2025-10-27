// Generated SW with audio precache
const CACHE_NAME = "hsk-pwa-v2025-10-28-audio1";
const PRECACHE_URLS = (function() {{
  const scope = self.registration && self.registration.scope ? new URL(self.registration.scope).pathname : '/';
  function u(p) {{ try {{ return new URL(p, scope).pathname; }} catch(e) {{ return p; }} }}
  return [
    u(''),
    u('index.html'),
    u('audio/bgm.mp3'),
    u('audio/%E6%B0%B4%E5%A2%A8.MP3')
  ];
}})();

self.addEventListener('install', (event) => {{
  event.waitUntil((async()=>{{
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    self.skipWaiting();
  }})());
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil((async()=>{{
    const names = await caches.keys();
    await Promise.all(names.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)));
    self.clients.claim();
  }})());
}});

self.addEventListener('message', (event)=>{{
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
}});

self.addEventListener('fetch', (event) => {{
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isAudio = /\.(mp3|m4a|aac|ogg|wav)$/i.test(url.pathname);
  const isStatic = /\.(png|jpg|jpeg|gif|webp|svg|css|js|woff2?)$/i.test(url.pathname) || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  const isData = /\.(json|txt)$/i.test(url.pathname);

  if (isAudio || isStatic) {{
    event.respondWith((async()=>{{
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(req, {{ignoreSearch:true}});
      if (hit) return hit;
      try {{ const res = await fetch(req); if (res && res.ok) cache.put(req, res.clone()); return res; }}
      catch(e) {{ return hit || Response.error(); }}
    }})());
  }} else if (isData) {{
    event.respondWith((async()=>{{
      const cache = await caches.open(CACHE_NAME);
      try {{ const res = await fetch(req); if (res && res.ok) cache.put(req, res.clone()); return res; }}
      catch(e) {{ const hit = await cache.match(req, {{ignoreSearch:true}}); if (hit) return hit; throw e; }}
    }})());
  }}
}});
