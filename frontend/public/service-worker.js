const CACHE_NAME = 'intellicred-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Offline fallback for forensic data sync
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Periodic Sync for Offline Declarations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forensic-data') {
    event.waitUntil(syncDeclarations());
  }
});

async function syncDeclarations() {
  console.log('IntelliCred: Syncing offline declarations...');
  // Logic to pull from IndexedDB and POST to backend
}
