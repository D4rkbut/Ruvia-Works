// Suba este número a cada novo deploy (ajuda a forçar troca de cache)
const SW_VERSION = "ruvia-v7.3-viewport-runtime";
const CACHE_NAME = `ruvia-${SW_VERSION}`;
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  // Não força skipWaiting sozinho: espera o app pedir (evita trocar o SW
  // no meio do uso sem o usuário/app saber). Veja o listener "message" abaixo.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Permite que a página mande "SKIP_WAITING" assim que detectar um SW novo,
// fazendo a atualização acontecer na hora (ver script em index.html).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING" || event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const isNavigation =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    // Network-first para HTML: sempre tenta buscar a versão nova primeiro.
    // Só usa o cache se estiver offline. Assim o app nunca fica "preso"
    // numa versão antiga do index.html.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  // Demais arquivos (ícones, manifest etc.): cache-first com atualização
  // em segundo plano (stale-while-revalidate).
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
