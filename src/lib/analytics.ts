/**
 * Analytics nhẹ first-party (không cookie bên thứ 3, không tool ngoài).
 * - parseUtm: hàm THUẦN tách utm_source/medium/campaign từ query string (test được).
 * - getAnonId: id ẩn danh lưu localStorage (không phải PII).
 * - captureUtm: lưu UTM "first-touch" 1 lần — đo kênh TikTok/FB theo MARKETING_LAUNCH.
 * - trackPageview / trackEvent: gửi beacon tới /api/analytics (sendBeacon → không chặn điều hướng).
 * Chỉ chạy ở production để không làm bẩn số liệu khi dev.
 */

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
}

const UTM_KEY = "mm_utm_first";
const ANON_KEY = "mm_anon_id";
const MAX_LEN = 100;

/** Tách UTM từ query string. Thuần — không đụng window. */
export function parseUtm(search: string): UtmParams {
  const out: UtmParams = {};
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const source = params.get("utm_source")?.trim().slice(0, MAX_LEN);
    const medium = params.get("utm_medium")?.trim().slice(0, MAX_LEN);
    const campaign = params.get("utm_campaign")?.trim().slice(0, MAX_LEN);
    if (source) out.source = source;
    if (medium) out.medium = medium;
    if (campaign) out.campaign = campaign;
  } catch {
    /* query string hỏng → bỏ qua */
  }
  return out;
}

/** Id ẩn danh bền vững theo trình duyệt (không gắn với tài khoản). */
export function getAnonId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

/** Lưu UTM first-touch (chỉ ghi lần đầu — đo đúng kênh dẫn người dùng đến). */
export function captureUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(UTM_KEY);
    if (saved) return JSON.parse(saved) as UtmParams;
    const utm = parseUtm(window.location.search);
    if (utm.source || utm.medium || utm.campaign) {
      localStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
    return utm;
  } catch {
    return {};
  }
}

interface TrackBody {
  name: string;
  path: string;
  referrer?: string;
  anonId: string;
  utm?: UtmParams;
}

function send(body: TrackBody): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return; // không đếm khi dev
  try {
    const json = JSON.stringify(body);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([json], { type: "application/json" }));
    } else {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* analytics không bao giờ được làm hỏng UX */
  }
}

/** Ghi 1 pageview (gọi khi đổi route). */
export function trackPageview(path: string): void {
  send({
    name: "pageview",
    path: path.slice(0, 200),
    referrer: typeof document !== "undefined" ? document.referrer.slice(0, 200) : undefined,
    anonId: getAnonId(),
    utm: captureUtm(),
  });
}

/** Ghi 1 sự kiện tùy ý (vd: "story_generated", "share_card"). */
export function trackEvent(name: string, path?: string): void {
  send({
    name: name.slice(0, 60),
    path: (path ?? (typeof window !== "undefined" ? window.location.pathname : "/")).slice(0, 200),
    anonId: getAnonId(),
    utm: captureUtm(),
  });
}
