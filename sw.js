/* 윌리엄 계산기: 최초 접속 후 오프라인 실행 지원 */
const CACHE = 'william-prep-pwa-v7-20261110';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/maskable-icon-512.png', './icons/apple-touch-icon.png',
  './icons/favicon-32.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put('./index.html', copy)).catch(() => {});
      }
      return response;
    }).catch(async () =>
      (await caches.match(req)) || (await caches.match('./index.html')) || Response.error()
    ));
  } else {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});
