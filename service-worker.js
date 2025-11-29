
const CACHE_NAME = 'mst-ultimate-cache-v1';

// List of URLs to cache immediately on install
// Note: Since this is a dev environment without a bundler, we cache the shell
// and rely on runtime caching for the dynamic modules.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/favicon.ico'
];

// Domains that should be cached (CDNs)
const CACHE_DOMAINS = [
  'cdn.tailwindcss.com',
  'aistudiocdn.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_URLS);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Check if request is for one of our target domains or a local file
  const isTargetDomain = CACHE_DOMAINS.some(domain => url.hostname.includes(domain));
  const isLocalFile = url.origin === self.location.origin;

  if (isTargetDomain || isLocalFile) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Strategy: Stale-While-Revalidate
          // Return cached response immediately if available, but also update the cache in the background
          
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }).catch(() => {
             // Network failed, nothing to do here, hope we returned a cached response
          });

          return cachedResponse || fetchPromise;
        })
    );
  }
});
