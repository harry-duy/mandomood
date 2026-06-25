/**
 * dailyXp.ts — tổng hợp XP từ các khoá XP-theo-ngày trong localStorage. PURE, test được.
 *
 * `useProgress` ghi XP mỗi ngày vào khoá `mm_xp_YYYY-MM-DD` (cộng dồn trong ngày).
 * KHÔNG có khoá tổng `mm_xp_total` (trước đây /notifications đọc khoá này → luôn 0
 * → thông báo mốc XP "Đạt N XP" KHÔNG bao giờ hiện). Hàm này cộng các khoá ngày để
 * ra tổng XP phía client (offline-first), thay cho khoá tổng không tồn tại.
 */

const XP_DAY_KEY = /^mm_xp_\d{4}-\d{2}-\d{2}$/;

/** True nếu key là khoá XP-theo-ngày hợp lệ (mm_xp_YYYY-MM-DD). */
export function isDailyXpKey(key: string): boolean {
  return XP_DAY_KEY.test(key);
}

/**
 * Cộng XP từ danh sách cặp [key, value] (vd duyệt localStorage).
 * Chỉ cộng key `mm_xp_YYYY-MM-DD`; value parse số, bỏ qua giá trị hỏng/âm.
 */
export function sumDailyXp(entries: Iterable<[string, string | null]>): number {
  let total = 0;
  for (const [key, value] of entries) {
    if (!isDailyXpKey(key)) continue;
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) total += n;
  }
  return total;
}
