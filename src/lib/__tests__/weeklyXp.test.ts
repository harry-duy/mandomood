import { test } from "node:test";
import assert from "node:assert/strict";
import { effectiveWeeklyXp } from "../weeklyXp";

const NOW = new Date(2026, 5, 24, 10); // thứ Tư 2026-06-24
const future = new Date(2026, 5, 29); // thứ Hai kế tiếp (tương lai)
const past = new Date(2026, 5, 22); // thứ Hai tuần này đã qua (quá khứ)

test("reset ở tương lai → weekly_xp thuộc tuần hiện tại, giữ nguyên", () => {
  assert.equal(effectiveWeeklyXp(840, future, NOW), 840);
});

test("reset đã qua (tuần cũ) → coi như 0", () => {
  assert.equal(effectiveWeeklyXp(840, past, NOW), 0);
});

test("thiếu mốc reset → 0", () => {
  assert.equal(effectiveWeeklyXp(500, undefined, NOW), 0);
  assert.equal(effectiveWeeklyXp(500, null, NOW), 0);
});

test("weekly_xp = 0 hoặc không hợp lệ → 0", () => {
  assert.equal(effectiveWeeklyXp(0, future, NOW), 0);
  assert.equal(effectiveWeeklyXp(NaN, future, NOW), 0);
  assert.equal(effectiveWeeklyXp(-50, future, NOW), 0);
  assert.equal(effectiveWeeklyXp("abc", future, NOW), 0);
});

test("nhận reset dạng ISO string / number", () => {
  assert.equal(effectiveWeeklyXp(300, future.toISOString(), NOW), 300);
  assert.equal(effectiveWeeklyXp(300, future.getTime(), NOW), 300);
  assert.equal(effectiveWeeklyXp(300, "không-phải-ngày", NOW), 0);
});

test("đúng mốc biên: reset == now → đã sang tuần mới → 0", () => {
  assert.equal(effectiveWeeklyXp(700, new Date(NOW), NOW), 0);
});
