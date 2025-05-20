
// MekarMap Service Worker for PWA functionality

// Add type definitions for service worker events
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

const CACHE_NAME = 'mekarmap-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache core app shell assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request as it's a stream that can only be consumed once
        const fetchRequest = event.request.clone();

        // Make network request and cache the response
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response as it's a stream that can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, serve offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return Promise.reject("Failed to fetch");
      })
  );
});

// For TypeScript
export {};
