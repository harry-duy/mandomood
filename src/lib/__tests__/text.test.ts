import { test } from "node:test";
import assert from "node:assert/strict";
import { splitSentences, normalizePinyin, normalizeHanzi, normalizeSentenceHanzi } from "../text";

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


test("normalizePinyin: bỏ dấu thanh + gom khoảng trắng + viết thường", () => {
  assert.equal(normalizePinyin("Nǐ hǎo"), "nihao");
  assert.equal(normalizePinyin("nǐ"), "ni");
  assert.equal(normalizePinyin("HǍO"), "hao");
});

test("normalizePinyin: ü → v (đúng kiểu gõ bàn phím nv/lv)", () => {
  assert.equal(normalizePinyin("nǚ"), "nv");
  assert.equal(normalizePinyin("lǜ"), "lv");
  assert.equal(normalizePinyin("nü"), "nv");
});

test("normalizePinyin: bỏ dấu câu / ký tự lạ", () => {
  assert.equal(normalizePinyin("Hǎo, ma?"), "haoma");
  assert.equal(normalizePinyin("  wǒ  "), "wo");
});

test("normalizeHanzi: chỉ bỏ khoảng trắng (giữ nguyên chữ Hán)", () => {
  assert.equal(normalizeHanzi(" 你 好 "), "你好");
  assert.equal(normalizeHanzi("我爱你"), "我爱你");
});

test("normalizeSentenceHanzi: chỉ GIỮ ký tự Hán (bỏ dấu câu/latin/số/space)", () => {
  assert.equal(normalizeSentenceHanzi("你好，世界！abc 123"), "你好世界");
  assert.equal(normalizeSentenceHanzi("我 爱 你。"), "我爱你");
  assert.equal(normalizeSentenceHanzi("（开心）"), "开心");
});
