import { test } from "node:test";
import assert from "node:assert/strict";
import { CHARACTERS } from "../characters";

test("kho chữ không rỗng", () => {
  assert.ok(CHARACTERS.length >= 20);
});

test("mỗi chữ có đủ field bắt buộc + hsk hợp lệ 1..6", () => {
  for (const c of CHARACTERS) {
    assert.ok(c.hanzi && c.pinyin && c.meaning && c.emotional_hook && c.category);
    assert.ok(Number.isInteger(c.hsk) && c.hsk >= 1 && c.hsk <= 6);
  }
});

test("hanzi KHÔNG trùng (tránh URL sitemap lặp)", () => {
  const set = new Set(CHARACTERS.map((c) => c.hanzi));
  assert.equal(set.size, CHARACTERS.length);
});

test("hanzi mã hoá URL được (an toàn cho sitemap)", () => {
  for (const c of CHARACTERS) {
    const enc = encodeURIComponent(c.hanzi);
    assert.ok(enc.length > 0);
    assert.equal(decodeURIComponent(enc), c.hanzi);
  }
});
