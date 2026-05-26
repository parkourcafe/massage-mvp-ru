// Service worker for the installable MassageMatch PWA.
// Bump CACHE when the precache list or caching strategy changes so old
// caches are dropped on activate.
const CACHE = "mm-pwa-v1";
const OFFLINE_FALLBACK = "/app";
const PRECACHE = ["/app"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Only cache safe, public, non-personalized pages for offline use.
function isCacheableNav(pathname) {
  if (pathname === "/") return true;
  return /^\/(app|therapist|therapists|pricing|examples|terms|privacy|subscription-terms|offer|nearby)(\/|$)/.test(
    pathname
  );
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|svg|webp|gif|ico)$/.test(pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept dynamic, personalized or API routes.
  if (
    /^\/(api|admin|dashboard|login|client|booking)(\/|$)/.test(url.pathname)
  ) {
    return;
  }

  // Page navigations: network-first so online users always get fresh
  // content; fall back to cache, then the app shell, when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (
            res &&
            res.ok &&
            res.type === "basic" &&
            isCacheableNav(url.pathname)
          ) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((cached) => cached || caches.match(OFFLINE_FALLBACK))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
