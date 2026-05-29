"use client";

/**
 * usePushNotification — hook đăng ký Web Push
 *
 * Usage:
 *   const { subscribed, subscribe, supported } = usePushNotification();
 *   <button onClick={subscribe}>Bật thông báo</button>
 */

import { useState, useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Fixed = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64Fixed);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotification() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(ok);

    if (ok) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      }).catch(() => null);
    }
  }, []);

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
    }
  };

  return { supported, subscribed, loading, subscribe, unsubscribe };
}
