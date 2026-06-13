import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeTests, pctOf, type TestResult } from "../testHistory";

function mk(score: number, total = 10, level = "hsk1", date = "2026-06-12T00:00:00Z"): TestResult {
  return { level, score, total, date };
}

test("pctOf: làm tròn phần trăm", () => {
  assert.equal(pctOf(mk(7)), 70);
  assert.equal(pctOf(mk(1, 3)), 33);
  assert.equal(pctOf(mk(10)), 100);
});

test("summarizeTests: recent đảo thứ tự CŨ→MỚI, giới hạn n", () => {
  // lịch sử lưu mới nhất đứng đầu
  const h = [mk(9), mk(8), mk(7), mk(6)];
  const s = summarizeTests(h, 3);
  assert.deepEqual(s.recent.map(pctOf), [70, 80, 90]); // cũ → mới
  assert.equal(s.count, 4);
});

test("summarizeTests: best/avg trên toàn lịch sử", () => {
  const s = summarizeTests([mk(10), mk(5), mk(6)]);
  assert.equal(s.best, 100);
  assert.equal(s.avg, 70); // (100+50+60)/3
});

test("summarizeTests: rỗng → 0 tất cả, loại bản ghi total=0", () => {
  const s = summarizeTests([]);
  assert.deepEqual([s.best, s.avg, s.count], [0, 0, 0]);
  const s2 = summarizeTests([{ level: "hsk1", score: 0, total: 0, date: "x" }]);
  assert.equal(s2.count, 0);
});
