/**
 * streak.ts — tính CHUỖI NGÀY HỌC liên tiếp (streak kiểu Duolingo). PURE, không I/O.
 *
 * Nguồn chân lý DUY NHẤT cho streak để mọi nơi (/progress, NextLesson, …) hiển thị
 * GIỐNG NHAU. Trước đây mỗi nơi tự tính → lệch số:
 *  - /progress đứt chuỗi ngay khi hôm nay chưa học (hiện 0 lúc sáng → gây nản).
 *  - NextLesson cắt ngày bằng toISOString() (UTC) → lệch ngày với giờ VN (UTC+7).
 *
 * Quy ước ở đây:
 *  - "ngày hoạt động" = khoá ngày theo GIỜ ĐỊA PHƯƠNG dạng YYYY-MM-DD.
 *  - Ân hạn 1 ngày: hôm nay CHƯA học không làm đứt chuỗi — vẫn tính từ hôm qua.
 */

/** Khoá ngày YYYY-MM-DD theo GIỜ ĐỊA PHƯƠNG (không dùng UTC). */
export function dayKeyLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Đếm số ngày liên tiếp gần nhất có hoạt động, có ÂN HẠN cho hôm nay.
 * @param activeDayKeys danh sách khoá ngày YYYY-MM-DD (local) có hoạt động.
 * @param today mốc "hôm nay" (mặc định bây giờ) — cho phép test xác định.
 */
export function computeStreak(
  activeDayKeys: Iterable<string>,
  today: Date = new Date()
): number {
  const days = new Set(activeDayKeys);
  if (days.size === 0) return 0;

  const cursor = new Date(today);
  // Ân hạn: nếu hôm nay chưa có hoạt động, bắt đầu đếm từ hôm qua.
  if (!days.has(dayKeyLocal(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  // Giới hạn 366 vòng để an toàn (không lặp vô hạn nếu data lạ).
  for (let i = 0; i < 366; i++) {
    if (days.has(dayKeyLocal(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Tiện ích: đổi danh sách mốc thời gian (ISO string / Date) thành khoá ngày LOCAL
 * rồi đếm streak. Dùng cho nguồn dữ liệu là timestamp (vd mm_story_history.createdAt).
 */
export function computeStreakFromTimestamps(
  timestamps: Array<string | number | Date>,
  today: Date = new Date()
): number {
  const keys: string[] = [];
  for (const t of timestamps) {
    const d = new Date(t);
    if (!isNaN(d.getTime())) keys.push(dayKeyLocal(d));
  }
  return computeStreak(keys, today);
}

export interface WeekDay {
  /** Khoá ngày YYYY-MM-DD (local). */
  key: string;
  /** Đối tượng Date của ngày đó. */
  date: Date;
  /** Có hoạt động trong ngày này không. */
  active: boolean;
  /** Có phải hôm nay không (ô cuối cùng). */
  isToday: boolean;
}

/**
 * Dựng 7 ô lịch (cũ → mới, ô cuối = hôm nay) cho StreakCalendar, khớp ngày
 * theo GIỜ ĐỊA PHƯƠNG (đồng bộ với dayKeyLocal). Trước đây StreakCalendar tự
 * khoá ngày bằng toISOString() (UTC) → user VN (UTC+7) buổi sáng bị tô SAI ô /
 * hoạt động daily-plan (khoá local) không khớp. PURE — test được.
 */
export function buildWeekDays(
  activeDayKeys: Iterable<string>,
  today: Date = new Date()
): WeekDay[] {
  const set = new Set(activeDayKeys);
  const out: WeekDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKeyLocal(d);
    out.push({ key, date: d, active: set.has(key), isToday: i === 0 });
  }
  return out;
}
