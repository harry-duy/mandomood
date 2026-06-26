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


/**
 * Mốc reset XP tuần KẾ TIẾP = thứ Hai 00:00 theo GIỜ VIỆT NAM (UTC+7), trả về
 * dưới dạng instant UTC. PURE, test được. Trước đây route tính Monday 00:00 theo
 * giờ server (UTC) → reset lúc 07:00 thứ Hai VN, lệch nửa đêm VN như streak/quota.
 * Giữ NGUYÊN ngữ nghĩa cũ: nếu HÔM NAY là thứ Hai thì mốc kế tiếp là thứ Hai TUẦN SAU.
 */
export function nextMondayVN(now: Date = new Date()): Date {
  // Dịch sang giờ tường VN rồi đọc field UTC (độc lập timezone server).
  const vn = new Date(now.getTime() + 7 * 3600 * 1000);
  const day = vn.getUTCDay(); // 0=CN, 1=T2 … theo giờ VN
  const diff = day === 0 ? 1 : 8 - day; // số ngày tới thứ Hai kế tiếp (T2→+7)
  const vnMidnight = Date.UTC(
    vn.getUTCFullYear(),
    vn.getUTCMonth(),
    vn.getUTCDate() + diff,
    0, 0, 0, 0
  );
  // vnMidnight là "nửa đêm VN" biểu diễn bằng field UTC → trừ 7h ra instant UTC thật.
  return new Date(vnMidnight - 7 * 3600 * 1000);
}
