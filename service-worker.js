const CACHE_NAME = 'zanime-cache-v3';
const repoName = 'pwalucianotrabalho';
const basePath = `/${repoName}`;

const urlsToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/cad.html`, 
  `${basePath}/la.html`,
  `${basePath}/style.css`,
  `${basePath}/script.js`,
  `${basePath}/manifest.json`,
  `${basePath}/icon-192.png`,
  `${basePath}/icon-512.png`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache instalado para:', basePath);
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Não cachear API externa
  if (event.request.url.includes('api.jikan.moe')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Verifica se é uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('Fetch failed; returning offline page:', error);
            // Para requisições de página, retorna a index
            if (event.request.destination === 'document') {
              return caches.match(`${basePath}/index.html`);
            }
          });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
