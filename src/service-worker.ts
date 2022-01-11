/// <reference lib="WebWorker" />

import { build, files, timestamp } from '$service-worker';
const cacheName = `Mosasic${timestamp}`;

self.addEventListener("install", (installEvent) => {

  installEvent.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll([...build, ...files, "/"]))
  );

  self.skipWaiting();
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

  const {request} = fetchEvent;
  const url = new URL(request.url);

  if (
    url.pathname === '/' &&
    url.searchParams.has('share-target') &&
    request.method === 'POST'
  ) {
     // Redirect so the user can refresh the page without resending data.
    fetchEvent.respondWith(Response.redirect('/?share-target'));
    fetchEvent.waitUntil(
      (async function () {
        // The page sends this message to tell the service worker it's ready to receive the file.
        await nextMessage('share-ready');
        const dataPromise = fetchEvent.request.formData();
        const client = await self.clients.get(fetchEvent.resultingClientId);
        const data = await dataPromise;
        const file = data.get('file');
        client!.postMessage({ file, action: 'load-image' });
      })(),
    );
    return ;
  }

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


const nextMessageResolveMap = new Map<string, (() => void)[]>();

/**
 * Wait on a message with a particular event.data value.
 *
 * @param dataVal The event.data value.
 */
 function nextMessage(dataVal: string): Promise<void> {
  return new Promise((resolve) => {
    if (!nextMessageResolveMap.has(dataVal)) {
      nextMessageResolveMap.set(dataVal, []);
    }
    nextMessageResolveMap.get(dataVal)!.push(resolve);
  });
}

self.addEventListener('message', (event) => {
  const resolvers = nextMessageResolveMap.get(event.data);
  if (!resolvers) return;
  nextMessageResolveMap.delete(event.data);
  for (const resolve of resolvers) resolve();
});

