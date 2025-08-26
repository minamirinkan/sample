/* eslint-disable no-restricted-globals */

self.addEventListener("install", (event: any) => {
    console.log("Service Worker installing.");
});

self.addEventListener("activate", (event: any) => {
    console.log("Service Worker activated.");
});

self.addEventListener("fetch", (event: any) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
