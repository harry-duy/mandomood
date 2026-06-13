import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyRotationIndex } from "../daily";

test("dailyRotationIndex: luôn nằm trong [0, len)", () => {
  for (let d = 0; d < 400; d++) {
    const date = new Date(2026, 0, 1 + d);
    const idx = dailyRotationIndex(date, 15);
    assert.ok(idx >= 0 && idx < 15, `idx=${idx} ngoài [0,15)`);
    assert.ok(Number.isInteger(idx));
  }
});

test("dailyRotationIndex: hai ngày liên tiếp cho chỉ số khác nhau (xoay vòng)", () => {
  const a = dailyRotationIndex(new Date(2026, 5, 2), 15);
  const b = dailyRotationIndex(new Date(2026, 5, 3), 15);
  assert.notEqual(a, b);
});

test("dailyRotationIndex: ổn định trong cùng một ngày", () => {
  const a = dailyRotationIndex(new Date(2026, 5, 2, 8, 0, 0), 15);
  const b = dailyRotationIndex(new Date(2026, 5, 2, 23, 59, 0), 15);
  assert.equal(a, b);
});
