/**
 * weeklyXp.ts — XP tuần HỢP LỆ cho tuần hiện tại. PURE, không I/O, test được.
 *
 * Bối cảnh: `weekly_xp` được reset KIỂU LƯỜI (lazy) trong /api/user/progress —
 * chỉ reset khi user có hành động SAU thứ Hai. Hệ quả: user KHÔNG hoạt động tuần
 * này vẫn giữ `weekly_xp` của tuần TRƯỚC trong DB. Nếu leaderboard/weekly-report
 * đọc thẳng `weekly_xp` → hiển thị số CŨ (sai): người tuần trước cày nhiều nhưng
 * tuần này nghỉ vẫn đứng đầu bảng "tuần".
 *
 * Quy ước: `weekly_xp_reset` được đặt = thứ Hai KẾ TIẾP mỗi lần reset. Vậy
 * `weekly_xp` chỉ thuộc TUẦN HIỆN TẠI khi `weekly_xp_reset` còn ở TƯƠNG LAI
 * (> now). Nếu mốc reset đã qua (<= now) hoặc thiếu → số là của tuần cũ → coi 0.
 */

export function effectiveWeeklyXp(
  weeklyXp: unknown,
  weeklyXpReset: unknown,
  now: Date = new Date()
): number {
  const xp = typeof weeklyXp === "number" && Number.isFinite(weeklyXp) ? Math.max(0, weeklyXp) : 0;
  if (xp === 0) return 0;

  if (!weeklyXpReset) return 0; // chưa từng reset → coi như tuần cũ
  const reset = weeklyXpReset instanceof Date ? weeklyXpReset : new Date(weeklyXpReset as string | number);
  if (isNaN(reset.getTime())) return 0;

  // Mốc reset còn ở tương lai ⇒ weekly_xp thuộc tuần hiện tại; ngược lại là tuần cũ.
  return reset.getTime() > now.getTime() ? xp : 0;
}
