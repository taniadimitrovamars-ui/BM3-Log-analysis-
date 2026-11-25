// PITSTOP · BM3 Lab — service worker. Увеличавай CACHE при всяка нова версия на index.html.
const CACHE = 'pitstop-bm3-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(FILES.map((f) => c.add(f))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Първо мрежа (винаги нова версия), при липса на интернет - кеш
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(r, res.clone()));
        return res;
      })
      .catch(() => caches.match(r).then((hit) => hit || caches.match('./index.html')))
  );
});
