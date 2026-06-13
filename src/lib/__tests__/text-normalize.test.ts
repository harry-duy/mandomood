import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePinyin, normalizeHanzi, normalizeSentenceHanzi } from "../text";

test("normalizePinyin: bo dau thanh va khoang trang", () => {
  assert.equal(normalizePinyin("nǐ hǎo"), "nihao");
  assert.equal(normalizePinyin("Xiè xiè"), "xiexie");
});

test("normalizePinyin: u-umlaut tuong duong v (kieu go chuan)", () => {
  assert.equal(normalizePinyin("nǚ"), normalizePinyin("nv"));
  assert.equal(normalizePinyin("lǜ sè"), normalizePinyin("lvse"));
});

test("normalizePinyin: bo ky tu la, so giu nguyen", () => {
  assert.equal(normalizePinyin("ni3 hao3!"), "ni3hao3");
});

test("normalizeHanzi: chi bo khoang trang", () => {
  assert.equal(normalizeHanzi("你 好"), "你好");
  assert.equal(normalizeHanzi("谢谢"), "谢谢");
});

test("normalizeSentenceHanzi: bo dau cau va khoang trang", () => {
  assert.equal(normalizeSentenceHanzi("你好，我叫小明。"), "你好我叫小明");
  assert.equal(normalizeSentenceHanzi("我 爱 你！"), "我爱你");
});

test("normalizeSentenceHanzi: bo so va chu latin", () => {
  assert.equal(normalizeSentenceHanzi("HSK1：你好"), "你好");
});
