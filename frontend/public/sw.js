// Simplified, robust Service Worker
const CACHE_NAME = 'buzzo-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the updated worker to take over immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Take control of all pages immediately
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through: no caching to prevent "body already used" errors in dev
  // This ensures your app stays stable and avoids complex PWA caching bugs
  event.respondWith(fetch(event.request));
});
