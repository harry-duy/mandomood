/**
 * premium — logic THUẦN xác định quyền Premium (test được, dùng cả server lẫn client).
 *
 * Quy tắc:
 * - paid:  premium === true VÀ (không có premium_until = lifetime, hoặc premium_until > now).
 * - trial: trial_until > now (mọi tài khoản mới được tặng TRIAL_DAYS ngày khi đăng nhập lần đầu).
 * - effective premium = paid HOẶC trial. Hết cả hai → khóa các tính năng Premium,
 *   user muốn dùng tiếp thì mua ở /pricing.
 */

export const TRIAL_DAYS = 30;

/**
 * Khoá ngày YYYY-MM-DD theo GIỜ VIỆT NAM (UTC+7, không DST). Dùng cho ranh giới
 * "mỗi ngày" phía SERVER (Vercel chạy UTC nên `new Date().toISOString()` reset
 * lúc 07:00 VN — lệch với streak/mood/lịch vốn theo giờ VN). Quota AO free reset
 * đúng 00:00 VN sau khi dùng hàm này.
 */
export function vnDateKey(d: Date = new Date()): string {
  return new Date(d.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * CÙNG mốc thời gian nhưng dịch +7h — để khi đọc field LOCAL (getFullYear/Date…)
 * trên server chạy UTC (Vercel) sẽ ra GIỜ TƯỜNG Việt Nam. Dùng khi cần so sánh
 * "ngày" phía server theo giờ VN (vd streak), cho khớp lịch/mood/quota. KHÔNG
 * dùng để LƯU (chỉ phục vụ so sánh ngày); lưu vẫn dùng mốc UTC gốc.
 */
export function toVnTime(d: Date): Date {
  return new Date(d.getTime() + 7 * 3600 * 1000);
}

/**
 * Mốc 00:00 (nửa đêm) theo GIỜ VIỆT NAM của ngày chứa `now`, trả về instant UTC.
 * Dùng cho ranh giới "hôm nay" phía server (vd câu nói hôm nay) — để nội dung
 * ngày đổi đúng nửa đêm VN thay vì 07:00 (server UTC). Độc lập timezone server.
 */
export function vnDayStart(now: Date = new Date()): Date {
  const vn = new Date(now.getTime() + 7 * 3600 * 1000); // giờ tường VN qua field UTC
  const midnightVnAsUtc = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate(), 0, 0, 0, 0);
  return new Date(midnightVnAsUtc - 7 * 3600 * 1000); // quy về instant UTC thật
}

/** Giới hạn mỗi ngày cho tài khoản FREE (hết trial, chưa mua). */
export const FREE_DAILY_STORY = 3;
export const FREE_DAILY_CHAT = 10;
/** Quét ảnh/tài liệu AI (smart-lesson) — Vision tốn kém nhất, để rộng rãi. */
export const FREE_DAILY_UPLOAD = 5;

export type PremiumSource = "paid" | "trial" | null;

export interface PremiumInput {
  premium?: boolean | null;
  premium_until?: Date | string | null; // null/undefined khi premium=true nghĩa là lifetime
  trial_until?: Date | string | null;
}

function toMs(d: Date | string | null | undefined): number | null {
  if (d == null) return null;
  const ms = typeof d === "string" ? Date.parse(d) : d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** Premium TRẢ PHÍ còn hiệu lực? (premium_until null = lifetime) */
export function isPaidActive(input: PremiumInput, now: number = Date.now()): boolean {
  if (input.premium !== true) return false;
  if (input.premium_until == null) return true; // lifetime
  const until = toMs(input.premium_until);
  return until !== null && until > now; // ngày hỏng → từ chối cho an toàn
}

/** Trial còn hiệu lực? */
export function isTrialActive(input: PremiumInput, now: number = Date.now()): boolean {
  const until = toMs(input.trial_until);
  return until !== null && until > now;
}

/** Nguồn quyền premium hiện tại: "paid" ưu tiên hơn "trial"; null = free. */
export function premiumSource(input: PremiumInput, now: number = Date.now()): PremiumSource {
  if (isPaidActive(input, now)) return "paid";
  if (isTrialActive(input, now)) return "trial";
  return null;
}

/** User có quyền dùng tính năng Premium không (paid hoặc trial)? */
export function hasPremiumAccess(input: PremiumInput, now: number = Date.now()): boolean {
  return premiumSource(input, now) !== null;
}

/** Số ngày còn lại (làm tròn LÊN — còn 1 giờ vẫn là "còn 1 ngày"). 0 nếu đã hết/không có. */
export function daysLeft(until: Date | string | null | undefined, now: number = Date.now()): number {
  const ms = toMs(until);
  if (ms === null || ms <= now) return 0;
  return Math.ceil((ms - now) / 86_400_000);
}

/** Ngày hết trial cho tài khoản kích hoạt tại `now`. */
export function trialEndDate(now: number = Date.now()): Date {
  return new Date(now + TRIAL_DAYS * 86_400_000);
}

/** Các gói hợp lệ DUY NHẤT được phép thanh toán. */
export const VALID_PLANS = ["monthly", "yearly", "lifetime"] as const;
export type Plan = (typeof VALID_PLANS)[number];

/** Chuẩn hoá/kiểm tra gói từ client. Trả về plan hợp lệ hoặc null (chặn giá trị lạ). */
export function normalizePlan(plan: unknown): Plan | null {
  return typeof plan === "string" && (VALID_PLANS as readonly string[]).includes(plan)
    ? (plan as Plan)
    : null;
}

/**
 * Mốc hết hạn premium theo gói mua (dùng ở Stripe webhook checkout.completed).
 *  - "yearly"  → +1 năm
 *  - "lifetime"→ null (không hết hạn)
 *  - "monthly" hoặc giá trị lạ → +1 tháng (mặc định an toàn về chi phí: cấp ngắn nhất)
 * Trả Date hoặc null (lifetime).
 */
export function premiumUntilForPlan(plan: string, from: Date = new Date()): Date | null {
  if (plan === "lifetime") return null;
  const d = new Date(from);
  if (plan === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    // monthly + fallback an toàn
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}
