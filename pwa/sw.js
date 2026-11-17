/* ==========================================================================
   SERVICE WORKER · PORTAFOLIO PWA DE ALE
   Estrategias:
   - App shell local: cache-first.
   - Navegación: network-first con respaldo en caché.
   - Recursos externos: stale-while-revalidate.
   - Limpieza de caché limitada al prefijo de esta aplicación.
   ========================================================================== */
'use strict';

var CACHE_PREFIX = 'ale-hud-pwa-';
var CACHE_NAME = 'ale-hud-pwa-v10';
var RUNTIME_CACHE = 'ale-hud-pwa-runtime-v10';

var APP_SHELL = [
  './presentacion.html',
  './presentacion.css',
  './script.js',
  './shared/boot.js',
  './manifest.json',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png',
  './assets/placeholder.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        /* Cada recurso se guarda por separado: si uno falla, la instalación continúa. */
        return Promise.all(APP_SHELL.map(function (url) {
          return cache.add(url).catch(function () { return null; });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME && key !== RUNTIME_CACHE;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  /* Navegación: red primero, luego caché y app shell. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match('./presentacion.html');
          });
        })
    );
    return;
  }

  /* Recursos locales: caché inmediata + revalidación en segundo plano. */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        var red = fetch(request).then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
          }
          return response;
        }).catch(function () {
          return cached || caches.match('./presentacion.html');
        });

        return cached || red;
      })
    );
    return;
  }

  /* Recursos externos (CDN, imágenes, fuentes): stale-while-revalidate. */
  event.respondWith(
    caches.match(request).then(function (cached) {
      var network = fetch(request).then(function (response) {
        if (response && (response.ok || response.type === 'opaque')) {
          var copy = response.clone();
          caches.open(RUNTIME_CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () {
        return cached || new Response('', { status: 504, statusText: 'Sin conexión' });
      });

      return cached || network;
    })
  );
});
