const CACHE_NAME = 'liberty-radio-v2'; // Bump version
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Improved Fetch Strategy: Network first, fallback to cache
self.addEventListener('fetch', event => {
    // Skip cross-origin requests for the cache (like the radio streams)
    if (!event.request.url.startsWith(self.location.origin)) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
