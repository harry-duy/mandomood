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

/** Giới hạn mỗi ngày cho tài khoản FREE (hết trial, chưa mua). */
export const FREE_DAILY_STORY = 3;
export const FREE_DAILY_CHAT = 10;

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
