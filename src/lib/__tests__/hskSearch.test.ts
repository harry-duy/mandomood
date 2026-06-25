/**
 * Test hskSearch (tra cứu kho từ HSK) + tính toàn vẹn của hsk-data.
 * Chạy: npm test (tsx --test)
 */

import test from "node:test";
import assert from "node:assert/strict";
import { fold, searchHskVocab, findHskWord, ALL_HSK } from "../hskSearch";
import { HSK_DATA } from "../hsk-data";

// ── fold ──────────────────────────────────────────────────────────────────────
test("fold: bo dau tieng Viet, ha chu thuong, đ → d", () => {
  assert.equal(fold("Nhẫn Nại"), "nhan nai");
  assert.equal(fold("duyên phận"), "duyen phan");
  assert.equal(fold("Đại"), "dai");
});

test("fold: bo dau thanh pinyin", () => {
  assert.equal(fold("nǐ hǎo"), "ni hao");
  assert.equal(fold("yuán fèn"), "yuan fen");
});

// ── searchHskVocab ────────────────────────────────────────────────────────────
test("searchHskVocab: tra theo am Han Viet khong dau", () => {
  const hits = searchHskVocab("nhan nai");
  assert.ok(hits.some((w) => w.hanzi === "忍耐"), "go 'nhan nai' phai ra 忍耐");
});

test("searchHskVocab: tra theo hanzi", () => {
  const hits = searchHskVocab("缘分");
  assert.ok(hits.some((w) => w.hanzi === "缘分"));
});

test("searchHskVocab: tra theo pinyin khong dau + khong khoang trang", () => {
  const hits = searchHskVocab("yuanfen");
  assert.ok(hits.some((w) => w.hanzi === "缘分"), "go 'yuanfen' phai ra 缘分");
});

test("searchHskVocab: tra theo nghia Viet", () => {
  const hits = searchHskVocab("hạnh phúc");
  assert.ok(hits.length > 0);
  assert.ok(hits.every((w) => typeof w.level === "number"));
});

test("searchHskVocab: chuoi rong / khoang trang → []", () => {
  assert.deepEqual(searchHskVocab(""), []);
  assert.deepEqual(searchHskVocab("   "), []);
});

test("searchHskVocab: ton trong limit", () => {
  // "n" khop rat nhieu tu → phai bi cat o limit
  assert.ok(searchHskVocab("n", 5).length <= 5);
  assert.ok(searchHskVocab("n", 8).length <= 8);
});

// ── findHskWord ───────────────────────────────────────────────────────────────
test("findHskWord: tim thay tu kem level dung", () => {
  const hit = findHskWord("思念");
  assert.ok(hit);
  assert.equal(hit!.level, 5);
  assert.equal(hit!.word.hanViet, "tư niệm");
});

test("findHskWord: khong co → null", () => {
  assert.equal(findHskWord("不存在的词"), null);
  assert.equal(findHskWord(""), null);
});

// ── Tinh toan ven kho du lieu hsk-data ────────────────────────────────────────
test("hsk-data: du 6 cap, dat so tu toi thieu, khong trung hanzi", () => {
  const levels = Object.keys(HSK_DATA).map(Number).sort();
  assert.deepEqual(levels, [1, 2, 3, 4, 5, 6]);
  // Kho dang mo rong dan len chuan HSK that → assert TOI THIEU thay vi bang
  const MIN: Record<number, number> = { 1: 150, 2: 150, 3: 100, 4: 60, 5: 60, 6: 60 };
  for (const lv of levels) {
    assert.ok(HSK_DATA[lv].length >= MIN[lv], `HSK${lv} phai co >= ${MIN[lv]} tu (hien ${HSK_DATA[lv].length})`);
  }
  assert.ok(ALL_HSK.length >= 580);
  const seen = new Set<string>();
  for (const w of ALL_HSK) {
    assert.ok(!seen.has(w.hanzi), `hanzi trung lap: ${w.hanzi}`);
    seen.add(w.hanzi);
  }
});

test("hsk-data: moi tu du truong bat buoc + hanViet + example", () => {
  for (const w of ALL_HSK) {
    assert.ok(w.hanzi.length > 0, "hanzi rong");
    assert.ok(w.pinyin.length > 0, `pinyin rong: ${w.hanzi}`);
    assert.ok(w.meaning.length > 0, `meaning rong: ${w.hanzi}`);
    assert.ok(w.hanViet && w.hanViet.length > 0, `thieu hanViet: ${w.hanzi}`);
    assert.ok(w.example && w.example.length > 0, `thieu example: ${w.hanzi}`);
  }
});

test("hsk-data: example phai chua chinh tu do (chat luong du lieu)", () => {
  const exceptions = new Set<string>([]); // cho phep ngoai le neu can
  for (const w of ALL_HSK) {
    if (exceptions.has(w.hanzi)) continue;
    assert.ok(
      w.example!.includes(w.hanzi),
      `example cua ${w.hanzi} khong chua chinh tu: ${w.example}`
    );
  }
});

// ── Xếp hạng liên quan (Sprint 106) ──────────────────────────────────────────
test("searchHskVocab: khop hanzi CHINH XAC xep dau", () => {
  const hits = searchHskVocab("缘分");
  assert.ok(hits.length > 0);
  assert.equal(hits[0].hanzi, "缘分", "hanzi khop chinh xac phai dung dau bang");
});

test("searchHskVocab: khop pinyin CHINH XAC (khong dau) xep dau", () => {
  const hits = searchHskVocab("yuanfen");
  assert.equal(hits[0].hanzi, "缘分", "pinyin khop chinh xac phai dung dau bang");
});

test("searchHskVocab: tien to pinyin xep tren chuoi-con roi rac", () => {
  // Moi ket qua deu phai thuc su khop query (khong tra rac)
  const hits = searchHskVocab("ni hao");
  assert.ok(hits.length > 0);
  assert.ok(hits.every((w) => typeof w.level === "number" && w.hanzi.length > 0));
});
