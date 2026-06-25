"use client";

/**
 * usePushNotification — hook đăng ký Web Push
 *
 * Usage:
 *   const { subscribed, subscribe, supported } = usePushNotification();
 *   <button onClick={subscribe}>Bật thông báo</button>
 */

import { useState, useEffect, useSyncExternalStore } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Fixed = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64Fixed);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * `supported` là hằng số phía client (không đổi sau khi load) → dùng
 * useSyncExternalStore với server-snapshot = false: SSR render false,
 * client render giá trị thật ngay lần render thứ 2 — không setState trong
 * effect, không lệch hydration. (Pattern chuẩn React 19 cho client-only value.)
 */
const emptySubscribe = () => () => {};
const getSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
const getSupportedServer = () => false;

export function usePushNotification() {
  const supported = useSyncExternalStore(emptySubscribe, getSupported, getSupportedServer);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supported) return;
    // setSubscribed chỉ chạy trong .then (async) — không phải sync setState
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => null);
  }, [supported]);

  const subscribe = async (): Promise<boolean> => {
    if (!supported || !VAPID_PUBLIC) return false;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as any,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });

      if (res.ok) {
        setSubscribed(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error("[usePushNotification]", e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      setSubscribed(false);
      // Báo server gỡ subscription ngay (best-effort) → dừng push tức thì, không
      // phải chờ 1 lần gửi lỗi (404/410) mới được dọn ở cron due-reminder.
      try { await fetch("/api/push/subscribe", { method: "DELETE" }); } catch { /* offline — cron sẽ dọn sau */ }
    }
  };

  return { supported, subscribed, loading, subscribe, unsubscribe };
}
