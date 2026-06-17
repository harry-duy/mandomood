/**
 * MandoMood Service Worker (v6)
 * - Push notification listener
 * - Offline cache (PWA)
 *   • Cache-first cho tài nguyên tĩnh (Next static, icons, fonts) → mở app nhanh, dùng offline.
 *   • Stale-while-revalidate cho nội dung CÔNG KHAI (quote hằng ngày) → xem được khi offline.
 *   • Network-first cho điều hướng trang, fallback trang /offline.
 *   • KHÔNG cache API có dữ liệu người dùng (tránh rò rỉ dữ liệu giữa các tài khoản).
 */

const CACHE_NAME = "mandomood-v6";
const OFFLINE_URLS = ["/", "/offline", "/feed", "/leaderboard", "/flashcards", "/luyen-viet", "/explore", "/dictation", "/my-decks", "/hsk", "/lo-trinh"];

// Endpoint CÔNG KHAI an toàn để cache (không phụ thuộc đăng nhập)
const PUBLIC_API = ["/api/quotes/daily", "/api/quotes", "/api/leaderboard"];

// Install — precache offline pages.
// Dùng allSettled + cache.add từng URL: nếu MỘT route lỗi (redirect/500/mạng) thì
// SW VẪN cài được (khác cache.addAll() — atomic, 1 lỗi là hỏng toàn bộ install → mất offline).
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(OFFLINE_URLS.map((u) => cache.add(u)))
    )
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

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:woff2?|ttf|otf|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // 1) Static assets → cache-first (nhanh + offline)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
            return res;
          })
      )
    );
    return;
  }

  // 2) Public API → stale-while-revalidate (xem nội dung cũ khi offline)
  if (PUBLIC_API.some((p) => url.pathname === p)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const network = fetch(event.request)
          .then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 3) Các API khác (dữ liệu người dùng) → luôn network, KHÔNG cache
  if (url.pathname.startsWith("/api/")) return;

  // 4) Điều hướng/trang → network-first, fallback cache rồi /offline
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return (
            (await caches.match("/offline")) ||
            (await caches.match("/")) ||
            Response.error()
          );
        }
        return Response.error();
      })
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
