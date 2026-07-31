const CACHE_NAME = 'movieflix-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-512.png'
];

// Instalar Service Worker y guardar en caché el shell de la aplicación
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de red con caída a caché (Network First) con soporte para CDNs externos
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isSameOrigin = e.request.url.startsWith(self.location.origin);
  const isTargetCDN = url.hostname === 'unpkg.com' || 
                      url.hostname === 'fonts.googleapis.com' || 
                      url.hostname === 'fonts.gstatic.com';

  // Solo interceptar peticiones del mismo origen o CDNs críticas para no interferir con Google Drive u otras APIs externas
  if (!isSameOrigin && !isTargetCDN) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Guardar copia actualizada en caché para recursos válidos o respuestas opacas de CDNs confiables
        if (response.status === 200 || (response.type === 'opaque' && isTargetCDN)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
