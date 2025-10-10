// Name and version of the cache — update version manually if needed
const CACHE_NAME = 'swim-rules-v2';
const ASSETS = [
  '/',               // root
  '/index.html',
  '/style.css',
  '/app.js',
  '/rules.json',
  '/infractions.json',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: pre-cache all essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Force this service worker to become active immediately
  self.skipWaiting();
});

// Activate: remove old caches instantly
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  // Claim all clients so new version takes effect immediately
  self.clients.claim();
});

// Fetch: serve cached content first, then update in background
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // Update cache with latest version
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => cachedResponse || Promise.reject('Network error'));
      return cachedResponse || fetchPromise;
    })
  );
});
