import { test } from "node:test";
import assert from "node:assert/strict";
import { sumDailyXp, isDailyXpKey } from "../dailyXp";

test("isDailyXpKey nhận đúng mm_xp_YYYY-MM-DD", () => {
  assert.ok(isDailyXpKey("mm_xp_2026-06-24"));
  assert.ok(!isDailyXpKey("mm_xp_total"));
  assert.ok(!isDailyXpKey("mm_xp_2026_6_24")); // sai định dạng
  assert.ok(!isDailyXpKey("mm_story_history"));
});

test("cộng đúng tổng XP các ngày", () => {
  const entries: [string, string | null][] = [
    ["mm_xp_2026-06-24", "120"],
    ["mm_xp_2026-06-23", "80"],
    ["mm_story_history", "[...]"], // bỏ qua
    ["mm_xp_total", "999"], // bỏ qua (không phải khoá ngày)
  ];
  assert.equal(sumDailyXp(entries), 200);
});

test("bỏ qua giá trị hỏng / âm / null", () => {
  const entries: [string, string | null][] = [
    ["mm_xp_2026-06-24", "abc"],
    ["mm_xp_2026-06-23", "-50"],
    ["mm_xp_2026-06-22", null],
    ["mm_xp_2026-06-21", "30"],
  ];
  assert.equal(sumDailyXp(entries), 30);
});

test("rỗng → 0", () => {
  assert.equal(sumDailyXp([]), 0);
});
