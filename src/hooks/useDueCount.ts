"use client";

/**
 * useDueCount — số thẻ từ/câu ĐẾN HẠN ÔN (next_review <= now).
 *
 * Dùng để hiển thị badge "cần ôn" trên thanh điều hướng. Cache cấp module
 * (2 phút) để không gọi API lặp lại mỗi lần đổi trang.
 *
 * Refactor (React 19): dùng useSyncExternalStore thay vì setState trong effect
 * — count nằm trong store module, effect chỉ kích hoạt fetch (async) → không
 * còn cascading render (rule react-hooks/set-state-in-effect).
 */

import { useEffect, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";

const TTL = 120_000; // 2 phút

// ── Store cấp module ──────────────────────────────────────────────────────────
let cached: { count: number; at: number } = { count: 0, at: 0 };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => cached.count;
const getServerSnapshot = () => 0;

let inflight = false;
async function refresh(): Promise<void> {
  if (inflight) return;
  inflight = true;
  try {
    const r = await fetch("/api/user/vocabulary?filter=due");
    const d = r.ok ? await r.json() : { cards: [] };
    const n = Array.isArray(d?.cards) ? d.cards.length : (d?.total ?? 0);
    cached = { count: n, at: Date.now() };
    emit();
  } catch {
    /* offline / lỗi mạng — giữ giá trị cũ */
  } finally {
    inflight = false;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDueCount(): number {
  const { data: session } = useSession();
  const count = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!session?.user) {
      if (cached.count !== 0) {
        cached = { count: 0, at: Date.now() };
        emit(); // cập nhật qua store — không setState trực tiếp trong effect
      }
      return;
    }
    if (Date.now() - cached.at < TTL) return; // cache còn hạn
    void refresh();
  }, [session]);

  return count;
}

/** Xoá cache để badge cập nhật ngay sau khi ôn xong / thêm thẻ. */
export function invalidateDueCount() {
  cached = { count: cached.count, at: 0 };
  void refresh();
}
