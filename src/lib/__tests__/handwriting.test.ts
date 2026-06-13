import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resample,
  normalizeStrokes,
  scoreCandidate,
  prepareReference,
  recognize,
  type Stroke,
} from "../handwriting";

test("resample: trả về đúng n điểm", () => {
  const line: Stroke = [[0, 0], [10, 0]];
  const r = resample(line, 16);
  assert.equal(r.length, 16);
  // điểm đầu/cuối giữ nguyên
  assert.deepEqual(r[0], [0, 0]);
  assert.ok(Math.abs(r[15][0] - 10) < 1e-6);
});

test("resample: nét 1 điểm không crash, lặp lại điểm đó", () => {
  const r = resample([[5, 5]], 8);
  assert.equal(r.length, 8);
  assert.deepEqual(r[0], [5, 5]);
  assert.deepEqual(r[7], [5, 5]);
});

test("normalizeStrokes: đưa toàn bộ điểm vào ô [0,1] và giữ tỉ lệ", () => {
  const strokes: Stroke[] = [[[0, 0], [100, 0]], [[0, 50], [100, 50]]];
  const norm = normalizeStrokes(strokes);
  const all = norm.flat();
  for (const [x, y] of all) {
    assert.ok(x >= -1e-9 && x <= 1 + 1e-9, `x=${x} trong [0,1]`);
    assert.ok(y >= -1e-9 && y <= 1 + 1e-9, `y=${y} trong [0,1]`);
  }
});

test("scoreCandidate: hai nét giống hệt → điểm ~ 0", () => {
  const u = normalizeStrokes([[[0, 0], [10, 10]]]);
  const score = scoreCandidate(u, u);
  assert.ok(score < 1e-6, `score=${score} phải gần 0`);
});

test("scoreCandidate: lệch số nét quá nhiều (>2) → Infinity", () => {
  const a = normalizeStrokes([[[0, 0], [1, 1]]]);
  const b = normalizeStrokes([
    [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]],
  ]);
  assert.equal(scoreCandidate(a, b), Infinity);
});

test("prepareReference: lật trục y (1024) và chuẩn hoá về [0,1]", () => {
  const medians = [[[0, 0], [512, 1024]]]; // 1 nét, toạ độ gốc hanzi-writer
  const ref = prepareReference(medians);
  const all = ref.flat();
  for (const [x, y] of all) {
    assert.ok(x >= -1e-9 && x <= 1 + 1e-9);
    assert.ok(y >= -1e-9 && y <= 1 + 1e-9);
  }
});

test("recognize: chọn đúng ứng viên khớp nhất, sắp xếp tăng theo score", () => {
  const userStroke: Stroke[] = [[[0, 0], [10, 10]]];
  const candidates = [
    { char: "对", refNorm: normalizeStrokes([[[0, 0], [10, 10]]]) },                 // khớp: đường chéo
    { char: "错", refNorm: normalizeStrokes([[[0, 0], [10, 0], [10, 10]]]) },        // khác hẳn: hình chữ L
  ];
  const res = recognize(userStroke, candidates, 2);
  assert.ok(res.length >= 1);
  assert.equal(res[0].char, "对");
  // sắp xếp không giảm
  for (let i = 1; i < res.length; i++) assert.ok(res[i].score >= res[i - 1].score);
});
