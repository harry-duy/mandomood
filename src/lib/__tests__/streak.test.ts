import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStreak, computeStreakFromTimestamps, dayKeyLocal } from "../streak";

// Mốc cố định để test xác định: 2026-06-24 (giờ địa phương).
const TODAY = new Date(2026, 5, 24, 10, 0, 0);
const k = (y: number, m: number, d: number) => dayKeyLocal(new Date(y, m - 1, d));

test("rỗng → streak 0", () => {
  assert.equal(computeStreak([], TODAY), 0);
});

test("học hôm nay + 2 ngày trước liên tiếp → 3", () => {
  const days = [k(2026, 6, 24), k(2026, 6, 23), k(2026, 6, 22)];
  assert.equal(computeStreak(days, TODAY), 3);
});

test("ÂN HẠN: hôm nay chưa học nhưng hôm qua + hôm kia có → vẫn 2 (không đứt)", () => {
  const days = [k(2026, 6, 23), k(2026, 6, 22)];
  assert.equal(computeStreak(days, TODAY), 2);
});

test("đứt khi thiếu cả hôm nay lẫn hôm qua → 0", () => {
  const days = [k(2026, 6, 22), k(2026, 6, 21)];
  assert.equal(computeStreak(days, TODAY), 0);
});

test("khoảng trống ở giữa làm dừng đếm", () => {
  // 24, 23 liên tiếp; 21 bị cách 1 ngày (thiếu 22) → chỉ đếm 2
  const days = [k(2026, 6, 24), k(2026, 6, 23), k(2026, 6, 21)];
  assert.equal(computeStreak(days, TODAY), 2);
});

test("trùng khoá ngày không tính lặp", () => {
  const days = [k(2026, 6, 24), k(2026, 6, 24), k(2026, 6, 23)];
  assert.equal(computeStreak(days, TODAY), 2);
});

test("computeStreakFromTimestamps: đổi timestamp→ngày local rồi đếm, bỏ qua mốc hỏng", () => {
  const ts = [
    new Date(2026, 5, 24, 8).toISOString(),
    new Date(2026, 5, 23, 22).toISOString(),
    "không-phải-ngày",
  ];
  assert.equal(computeStreakFromTimestamps(ts, TODAY), 2);
});

import { buildWeekDays } from "../streak";

test("buildWeekDays: 7 ô, ô cuối là hôm nay, khoá theo giờ địa phương", () => {
  const today = new Date(2026, 5, 24, 10);
  const w = buildWeekDays([dayKeyLocal(new Date(2026, 5, 24)), dayKeyLocal(new Date(2026, 5, 22))], today);
  assert.equal(w.length, 7);
  assert.equal(w[6].isToday, true);
  assert.equal(w[6].key, "2026-06-24");
  assert.equal(w[0].key, "2026-06-18"); // 6 ngày trước
  assert.equal(w[6].active, true); // hôm nay có hoạt động
  assert.equal(w[4].key, "2026-06-22");
  assert.equal(w[4].active, true);
  assert.equal(w[5].active, false); // 23 không có
});

test("buildWeekDays: không có hoạt động → tất cả active=false", () => {
  const w = buildWeekDays([], new Date(2026, 5, 24));
  assert.equal(w.length, 7);
  assert.ok(w.every((d) => !d.active));
  assert.equal(w.filter((d) => d.isToday).length, 1);
});
