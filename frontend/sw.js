const CACHE_NAME = 'eduai-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './app.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js'
];

// Install Service Worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

// Active Service Worker & Intercept Requests
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});