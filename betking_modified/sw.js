// BetKing Service Worker - v2
const CACHE = 'betking-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/data.js',
  '/js/state.js',
  '/js/utils.js',
  '/js/generate.js',
  '/js/render.js',
  '/js/viewer.js',
  '/js/slip.js',
  '/js/profile.js',
  '/js/storage.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
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
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
