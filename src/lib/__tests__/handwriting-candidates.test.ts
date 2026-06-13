import { test } from "node:test";
import assert from "node:assert/strict";
import { HANDWRITING_CHARSET, HANDWRITING_CANDIDATES } from "../handwriting-candidates";

test("charset: mọi entry là đúng 1 chữ Hán", () => {
  for (const c of HANDWRITING_CHARSET) {
    assert.equal(c.char.length, 1, `"${c.char}" phải là 1 ký tự`);
    assert.match(c.char, /[㐀-鿿]/u, `"${c.char}" phải là chữ Hán`);
  }
});

test("charset: không trùng lặp chữ", () => {
  const chars = HANDWRITING_CHARSET.map((c) => c.char);
  assert.equal(new Set(chars).size, chars.length, "không được có chữ trùng");
});

test("charset: phủ HSK1-2 đủ rộng (>= 150 chữ)", () => {
  assert.ok(HANDWRITING_CHARSET.length >= 150, `chỉ có ${HANDWRITING_CHARSET.length} chữ`);
});

test("charset: mỗi chữ có pinyin và meaning (trừ trợ từ pinyin có thể rỗng)", () => {
  for (const c of HANDWRITING_CHARSET) {
    assert.equal(typeof c.pinyin, "string");
    assert.ok(c.meaning && c.meaning.length > 0, `"${c.char}" thiếu nghĩa`);
  }
});

test("charset: lọc đã loại các entry rác (không phải chữ Hán) khỏi danh sách gốc", () => {
  // Danh sách gốc có thể chứa trùng/rác; charset đã làm sạch nên <= số gốc
  assert.ok(HANDWRITING_CHARSET.length <= HANDWRITING_CANDIDATES.length);
});
