const FILES_TO_CACHE = [
    '/offline.html',
];

const CACHE_NAME = 'MI_CACHE';

self.addEventListener('install', (event) => {

    /**
     * Precache offline page
     */
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('active', (event) => {

    /**
     * Remove old cache
     */
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', (event) => {

    if (event.request.mode !== 'navigate') {
        return;
    }
    
    /**
     * fetch offline page
     */
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match('offline.html');
                    });
            })
    );
});
