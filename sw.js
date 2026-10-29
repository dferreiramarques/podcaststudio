const CACHE = 'podcaststudio-v6';
const CDN_CACHE = 'podcaststudio-cdn-v1';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon-192.svg', '/icon-512.svg', '/favicon.svg'];
// Cross-origin assets the app depends on offline: fonts, icons, MP3 encoder
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];

const isCDN = url => CDN_HOSTS.some(h => url.includes(h));

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // Cross-origin CDN assets — cache-first so the app stays fully offline
  if (!url.startsWith(self.location.origin)) {
    if (!isCDN(url)) return;
    e.respondWith(
      caches.open(CDN_CACHE).then(c =>
        c.match(url).then(hit =>
          hit ||
          fetch(e.request).then(res => {
            // 200 (cors) and opaque (no-cors) responses can both be cached
            if (res.status === 200 || res.type === 'opaque') c.put(url, res.clone());
            return res;
          })
        )
      )
    );
    return;
  }

  // Same-origin GET requests
  // HTML entry points go network-first (with cache fallback) so users of the
  // installed app always receive new deploys; everything else is cache-first.
  const isHTML = url.split('?')[0].endsWith('/index.html') ||
                 new URL(url).pathname === '/';
  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request);
      if (isHTML) {
        try {
          const fresh = await fetch(e.request);
          if (fresh && fresh.status === 200) {
            const clone = fresh.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return fresh;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      }
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })()
  );
});
