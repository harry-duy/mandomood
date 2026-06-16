/**
 * Test practiceSheet — logic tách chữ luyện viết + clamp level.
 * Chạy: npm test (tsx --test)
 */

import test from "node:test";
import assert from "node:assert/strict";
import { isHanzi, uniqueCharsFromWords, clampLevel } from "../practiceSheet";

test("isHanzi: nhận diện chữ Hán, loại latin/dấu câu/số", () => {
  assert.equal(isHanzi("你"), true);
  assert.equal(isHanzi("好"), true);
  assert.equal(isHanzi("a"), false);
  assert.equal(isHanzi("，"), false);
  assert.equal(isHanzi("1"), false);
  assert.equal(isHanzi(" "), false);
});

test("uniqueCharsFromWords: tách từ → chữ đơn", () => {
  const out = uniqueCharsFromWords([
    { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào" },
  ]);
  assert.deepEqual(out.map((c) => c.char), ["你", "好"]);
  assert.equal(out[0].pinyin, "nǐ hǎo");
  assert.equal(out[0].meaning, "Xin chào");
});

test("uniqueCharsFromWords: loại trùng giữ lần đầu", () => {
  const out = uniqueCharsFromWords([
    { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào" },
    { hanzi: "你们", pinyin: "nǐ men", meaning: "Các bạn" }, // 你 trùng
  ]);
  assert.deepEqual(out.map((c) => c.char), ["你", "好", "们"]);
  // 你 giữ pinyin của từ đầu tiên
  assert.equal(out.find((c) => c.char === "你")?.pinyin, "nǐ hǎo");
});

test("uniqueCharsFromWords: bỏ ký tự không phải Hán trong từ", () => {
  const out = uniqueCharsFromWords([
    { hanzi: "A好B，", pinyin: "x", meaning: "y" },
  ]);
  assert.deepEqual(out.map((c) => c.char), ["好"]);
});

test("uniqueCharsFromWords: bỏ qua input lỗi/thiếu trường", () => {
  // @ts-expect-error test runtime guard
  const out = uniqueCharsFromWords([null, { hanzi: 123 }, { hanzi: "学" }]);
  assert.deepEqual(out.map((c) => c.char), ["学"]);
});

test("clampLevel: kẹp về 1..6, mặc định 1", () => {
  assert.equal(clampLevel("3"), 3);
  assert.equal(clampLevel(0), 1);
  assert.equal(clampLevel(9), 6);
  assert.equal(clampLevel("abc"), 1);
  assert.equal(clampLevel(undefined), 1);
  assert.equal(clampLevel(4.9), 4);
});
