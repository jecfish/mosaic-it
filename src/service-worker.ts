/// <reference lib="WebWorker" />

import { build, files, timestamp } from '$service-worker';
const cacheName = `Mosasic${timestamp}`;

self.addEventListener("install", (installEvent) => {
  self.skipWaiting();

  installEvent.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll([...build, ...files, "/"]))
  );
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			// delete old caches
			for (const key of keys) {
				if (key !== cacheName) await caches.delete(key);
			}

			self.clients.claim();
		})
	);
});


self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(fetchEvent.request))
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(fetchEvent.request);
      }
    )
  );
});