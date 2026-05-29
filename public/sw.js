/**
 * MandoMood Service Worker
 * - Push notification listener
 * - Offline cache (PWA)
 */

const CACHE_NAME = "mandomood-v1";
const OFFLINE_URLS = ["/", "/feed", "/leaderboard", "/flashcards"];

// Install — cache offline pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  // Only cache same-origin non-API requests
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "MandoMood 🌸";
  const options = {
    body: data.body ?? "Hôm nay bạn chưa học tiếng Trung!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag ?? "mandomood",
    data: { url: data.url ?? "/" },
    actions: [
      { action: "open", title: "Học ngay 📚" },
      { action: "close", title: "Để sau" },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
