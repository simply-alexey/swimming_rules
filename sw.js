const CACHE = 'swim-rules-v3';
const ASSETS = [
  '.',
  'index.html',
  'style.css',
  'app.js',
  'rules.json',
  'infractions.json',
  'manifest-wa.webmanifest'
];

// 🔹 Install new service worker and activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // ✅ Activate new SW without waiting for reload
});

// 🔹 Activate new version, remove old caches, take control of clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // ✅ Take control of all open pages
});

// 🔹 Cache-first fetch with network update fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      if (res) {
        // Update cache in background
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE).then(cache => cache.put(event.request, networkResponse.clone()));
          }
        }).catch(() => {}); // ignore errors when offline
        return res;
      }

      // If not cached, try network and cache it
      return fetch(event.request)
        .then(networkResponse => {
          const copy = networkResponse.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return networkResponse;
        })
        .catch(() => caches.match('index.html'));
    })
  );
});
