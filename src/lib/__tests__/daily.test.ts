import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyRotationIndex } from "../daily";

test("poolLength <= 0 → 0 (không chia 0)", () => {
  assert.equal(dailyRotationIndex(new Date(2026, 5, 24), 0), 0);
  assert.equal(dailyRotationIndex(new Date(2026, 5, 24), -5), 0);
});

test("cùng NGÀY → cùng index (xác định, không phụ thuộc giờ)", () => {
  const sang = dailyRotationIndex(new Date(2026, 5, 24, 3), 7);
  const toi = dailyRotationIndex(new Date(2026, 5, 24, 20), 7);
  assert.equal(sang, toi);
});

test("index LUÔN trong [0, poolLength)", () => {
  for (let d = 1; d <= 60; d++) {
    const idx = dailyRotationIndex(new Date(2026, 0, d), 7);
    assert.ok(idx >= 0 && idx < 7, `idx=${idx} ngoài [0,7) ở ngày ${d}`);
  }
});

test("ngày liên tiếp → index tăng đúng 1 (mod pool)", () => {
  const i1 = dailyRotationIndex(new Date(2026, 2, 10), 12);
  const i2 = dailyRotationIndex(new Date(2026, 2, 11), 12);
  assert.equal(i2, (i1 + 1) % 12);
});

test("xoay vòng: cách nhau đúng poolLength ngày → cùng index", () => {
  const a = dailyRotationIndex(new Date(2026, 0, 1), 5);
  const b = dailyRotationIndex(new Date(2026, 0, 6), 5); // +5 ngày
  assert.equal(a, b);
});
