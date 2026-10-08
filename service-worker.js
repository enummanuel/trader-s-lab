const CACHE_NAME = "traders-lab-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./login.html",
    "./signup.html",
    "./dashboard.html",
    "./journal.html",
    "./performance.html",
    "./analytics.html",
    "./team.html",
    "./settings.html",
    "./css/style.css"
];


self.addEventListener("install", function (event) {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(APP_SHELL);
            })
    );

    self.skipWaiting();
});


self.addEventListener("activate", function (event) {

    event.waitUntil(
        caches.keys().then(function (cacheNames) {

            return Promise.all(
                cacheNames
                    .filter(function (cacheName) {
                        return cacheName !== CACHE_NAME;
                    })
                    .map(function (cacheName) {
                        return caches.delete(cacheName);
                    })
            );

        })
    );

    self.clients.claim();
});


self.addEventListener("fetch", function (event) {

    event.respondWith(
        caches.match(event.request)
            .then(function (cachedResponse) {

                return cachedResponse ||
                    fetch(event.request);

            })
    );

});