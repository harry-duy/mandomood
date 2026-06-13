import { test } from "node:test";
import assert from "node:assert/strict";
import { sm2, nextReviewDate, masteryFromReps } from "../srs";

test("sm2: chuỗi nhớ hoàn hảo (q5) giãn khoảng tăng dần", () => {
  let s = { easeFactor: 2.5, interval: 1, repetitions: 0 };
  const intervals: number[] = [];
  for (let i = 0; i < 5; i++) {
    s = sm2(s.easeFactor, s.interval, s.repetitions, 5);
    intervals.push(s.interval);
  }
  assert.deepEqual(intervals, [1, 6, 16, 45, 131]);
  assert.equal(s.repetitions, 5);
  assert.ok(s.easeFactor > 2.5, "ease factor phải tăng khi nhớ tốt");
});

test("sm2: trả lời sai (q<3) reset lịch và hạ ease factor", () => {
  const r = sm2(2.5, 16, 3, 1);
  assert.equal(r.interval, 1);
  assert.equal(r.repetitions, 0);
  assert.ok(Math.abs(r.easeFactor - 2.3) < 1e-9);
});

test("sm2: ease factor không bao giờ xuống dưới sàn 1.3", () => {
  // Nhiều lần sai liên tiếp từ EF thấp
  let ef = 1.4;
  for (let i = 0; i < 5; i++) ef = sm2(ef, 5, 2, 0).easeFactor;
  assert.ok(ef >= 1.3, `EF=${ef} phải >= 1.3`);
});

test("sm2: lần đầu đúng = 1 ngày, lần hai đúng = 6 ngày", () => {
  const first = sm2(2.5, 1, 0, 4);
  assert.equal(first.interval, 1);
  const second = sm2(first.easeFactor, first.interval, first.repetitions, 4);
  assert.equal(second.interval, 6);
});

test("sm2: không sinh NaN với mọi quality hợp lệ 0..5", () => {
  for (let q = 0; q <= 5; q++) {
    const r = sm2(2.5, 10, 3, q);
    assert.ok(Number.isFinite(r.easeFactor) && Number.isFinite(r.interval) && Number.isFinite(r.repetitions));
  }
});

test("nextReviewDate: cộng đúng số ngày", () => {
  const from = new Date("2026-06-02T00:00:00Z");
  const d = nextReviewDate(6, from);
  assert.equal(d.toISOString().slice(0, 10), "2026-06-08");
});

test("masteryFromReps: mỗi 2 lần đúng = 1 sao, tối đa 5", () => {
  assert.equal(masteryFromReps(0), 0);
  assert.equal(masteryFromReps(3), 1);
  assert.equal(masteryFromReps(8), 4);
  assert.equal(masteryFromReps(20), 5);
});
