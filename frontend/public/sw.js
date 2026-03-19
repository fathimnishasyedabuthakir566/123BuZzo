const CACHE_NAME = 'buzzo-neural-cache-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Use individual add for each URL to avoid failing the whole cache if one fails
        return Promise.allSettled(
           urlsToCache.map(url => cache.add(url))
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) return response;

      // Otherwise, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Validate response before caching
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone the response safely
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
         // Fallback logic for network failure
         return caches.match('/');
      });
    })
  );
});
