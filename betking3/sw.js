// BetKing Service Worker - v3
const CACHE = 'betking-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/data2.js',
  '/js/state2.js',
  '/js/utils2.js',
  '/js/generate2.js',
  '/js/render2.js',
  '/js/viewer2.js',
  '/js/slip2.js',
  '/js/profile2.js',
  '/js/storage2.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
