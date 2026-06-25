import { test } from "node:test";
import assert from "node:assert/strict";
import { applyDailyStreak } from "../xpProgress";

const day = (y: number, m: number, d: number, h = 10) => new Date(y, m - 1, d, h);

test("cùng ngày → streak giữ nguyên, KHÔNG thưởng (không cộng lặp)", () => {
  const r = applyDailyStreak(day(2026, 6, 24, 8), day(2026, 6, 24, 20), 7);
  assert.equal(r.streak, 7);
  assert.equal(r.advanced, false);
  assert.equal(r.bonusXp, 0); // mốc 7 nhưng cùng ngày → KHÔNG thưởng lại
});

test("ngày liền kề đạt mốc 7 → +1 và thưởng 50 (đúng 1 lần)", () => {
  const r = applyDailyStreak(day(2026, 6, 23), day(2026, 6, 24), 6);
  assert.equal(r.streak, 7);
  assert.equal(r.advanced, true);
  assert.equal(r.bonusXp, 50);
});

test("mốc 30 → thưởng 200, mốc 100 → thưởng 500", () => {
  assert.equal(applyDailyStreak(day(2026, 6, 23), day(2026, 6, 24), 29).bonusXp, 200);
  assert.equal(applyDailyStreak(day(2026, 6, 23), day(2026, 6, 24), 99).bonusXp, 500);
});

test("ngày thường (không mốc) → +1, không thưởng", () => {
  const r = applyDailyStreak(day(2026, 6, 23), day(2026, 6, 24), 3);
  assert.equal(r.streak, 4);
  assert.equal(r.bonusXp, 0);
});

test("đứt chuỗi (cách >1 ngày) → reset về 1, không thưởng", () => {
  const r = applyDailyStreak(day(2026, 6, 20), day(2026, 6, 24), 50);
  assert.equal(r.streak, 1);
  assert.equal(r.advanced, true);
  assert.equal(r.bonusXp, 0);
});

test("prevStreak không hợp lệ (NaN/undefined) → coi như 0, reset về 1", () => {
  const r = applyDailyStreak(new Date(0), day(2026, 6, 24), NaN);
  assert.equal(r.streak, 1);
  assert.equal(r.bonusXp, 0);
});

test("KỊCH BẢN BUG CŨ: 3 hành động trong ngày mốc 7 → chỉ thưởng 50 MỘT lần", () => {
  // Hành động 1: từ hôm qua (streak 6) → lên 7, thưởng 50.
  const a1 = applyDailyStreak(day(2026, 6, 23), day(2026, 6, 24, 9), 6);
  // Hành động 2 & 3: cùng ngày 24, lastActive đã là 24 → không thưởng nữa.
  const a2 = applyDailyStreak(day(2026, 6, 24, 9), day(2026, 6, 24, 12), a1.streak);
  const a3 = applyDailyStreak(day(2026, 6, 24, 12), day(2026, 6, 24, 18), a2.streak);
  const totalBonus = a1.bonusXp + a2.bonusXp + a3.bonusXp;
  assert.equal(totalBonus, 50); // trước đây = 150
});
