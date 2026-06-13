"use client";

/**
 * pwa-install — bắt sự kiện `beforeinstallprompt` ở mức module và cho phép
 * kích hoạt cài đặt PWA theo yêu cầu (user bấm nút), KHÔNG tự bật popup.
 */

export interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredEvent: BIPEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredEvent = e as BIPEvent;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferredEvent = null;
    listeners.forEach((fn) => fn());
  });
}

/** App đang chạy ở chế độ đã cài (standalone)? */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

/** Có thể gọi prompt cài đặt gốc của trình duyệt không? */
export function canPromptInstall(): boolean {
  return deferredEvent !== null;
}

/** Đăng ký lắng nghe thay đổi trạng thái cài đặt. Trả về hàm huỷ. */
export function subscribeInstall(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Kích hoạt cài đặt.
 * @returns "accepted" | "dismissed" nếu prompt gốc chạy; "unavailable" nếu
 * trình duyệt không hỗ trợ (iOS Safari…) — UI nên hiện hướng dẫn thủ công.
 */
export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredEvent) return "unavailable";
  const evt = deferredEvent;
  deferredEvent = null;
  await evt.prompt();
  const choice = await evt.userChoice.catch(() => ({ outcome: "dismissed" as const }));
  listeners.forEach((fn) => fn());
  return choice.outcome;
}
