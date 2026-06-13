/**
 * testHistory — lưu lịch sử điểm thi /test vào localStorage (THUẦN logic, test được).
 * Dùng cho biểu đồ tiến bộ ở /progress: thấy điểm tăng dần theo thời gian = động lực.
 */
import { readJSON, writeJSON } from "./utils";

export interface TestResult {
  level: string;   // "hsk1".."hsk6"
  score: number;   // số câu đúng
  total: number;   // tổng số câu
  date: string;    // ISO
}

const KEY = "mm_test_history";
const MAX = 100;

export function getTestHistory(): TestResult[] {
  return readJSON<TestResult[]>(KEY, []);
}

/** Thêm 1 kết quả (mới nhất đứng đầu, cap MAX bản ghi). */
export function recordTestResult(r: Omit<TestResult, "date"> & { date?: string }): void {
  if (!r.level || r.total <= 0) return;
  const item: TestResult = {
    level: r.level,
    score: Math.max(0, Math.min(r.score, r.total)),
    total: r.total,
    date: r.date ?? new Date().toISOString(),
  };
  writeJSON(KEY, [item, ...getTestHistory()].slice(0, MAX));
}

/** Phần trăm đúng (0-100, làm tròn). */
export function pctOf(r: TestResult): number {
  return Math.round((r.score / r.total) * 100);
}

/**
 * Thống kê THUẦN cho biểu đồ /progress (nhận mảng để test được):
 * - recent: n lần gần nhất theo thứ tự CŨ → MỚI (vẽ trái → phải).
 * - best/avg: trên toàn lịch sử.
 */
export function summarizeTests(history: TestResult[], n = 12): {
  recent: TestResult[];
  best: number;
  avg: number;
  count: number;
} {
  const valid = history.filter((r) => r.total > 0);
  const recent = valid.slice(0, n).reverse();
  const pcts = valid.map(pctOf);
  return {
    recent,
    best: pcts.length ? Math.max(...pcts) : 0,
    avg: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0,
    count: valid.length,
  };
}
