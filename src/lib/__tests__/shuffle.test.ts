import { test } from "node:test";
import assert from "node:assert/strict";
import { shuffle } from "../shuffle";

test("shuffle: giữ nguyên độ dài và tập phần tử", () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const out = shuffle(input);
  assert.equal(out.length, input.length);
  assert.deepEqual([...out].sort((a, b) => a - b), [...input].sort((a, b) => a - b));
});

test("shuffle: không đột biến mảng gốc", () => {
  const input = [1, 2, 3];
  const copy = [...input];
  shuffle(input);
  assert.deepEqual(input, copy);
});

test("shuffle: mảng rỗng / 1 phần tử", () => {
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle([42]), [42]);
});

test("shuffle: có xáo trộn (xác suất) trên mảng lớn", () => {
  const input = Array.from({ length: 50 }, (_, i) => i);
  // Gần như không thể trả về y hệt thứ tự gốc với 50 phần tử
  let sameCount = 0;
  for (let t = 0; t < 5; t++) {
    const out = shuffle(input);
    if (out.every((v, i) => v === input[i])) sameCount++;
  }
  assert.ok(sameCount < 5, "shuffle phải thay đổi thứ tự ít nhất một lần");
});
