import { test } from "node:test";
import assert from "node:assert/strict";
import { splitSentences } from "../text";

test("splitSentences: tách theo dấu câu tiếng Trung, giữ dấu", () => {
  const r = splitSentences("你好。我爱你！再见？");
  assert.deepEqual(r, ["你好。", "我爱你！", "再见？"]);
});

test("splitSentences: tách theo xuống dòng và ；…", () => {
  const r = splitSentences("第一句；\n第二句…");
  assert.deepEqual(r, ["第一句；", "第二句…"]);
});

test("splitSentences: bỏ khoảng trắng thừa và phần tử rỗng", () => {
  const r = splitSentences("  你好。  \n  ");
  assert.deepEqual(r, ["你好。"]);
});

test("splitSentences: không có dấu kết → một câu", () => {
  assert.deepEqual(splitSentences("春天来了花开了"), ["春天来了花开了"]);
});

test("splitSentences: chuỗi rỗng → mảng rỗng", () => {
  assert.deepEqual(splitSentences(""), []);
  assert.deepEqual(splitSentences("   "), []);
});
