import { test } from "node:test";
import assert from "node:assert/strict";
import { generateVocabQuestions } from "../vocabQuiz";
import type { HSKWord } from "../hsk/types";

const WORDS: HSKWord[] = [
  { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào", hanViet: "nhĩ hảo" },
  { hanzi: "谢谢", pinyin: "xiè xie", meaning: "Cảm ơn", hanViet: "tạ tạ" },
  { hanzi: "再见", pinyin: "zài jiàn", meaning: "Tạm biệt", hanViet: "tái kiến" },
  { hanzi: "爱", pinyin: "ài", meaning: "Yêu", hanViet: "ái" },
  { hanzi: "家", pinyin: "jiā", meaning: "Nhà", hanViet: "gia" },
  { hanzi: "水", pinyin: "shuǐ", meaning: "Nước", hanViet: "thủy" },
];

test("sinh đúng số câu yêu cầu (đủ kho)", () => {
  const qs = generateVocabQuestions(WORDS, "hsk1", 4);
  assert.equal(qs.length, 4);
});

test("mỗi câu: 4 đáp án, không trùng, correct trỏ đúng đáp án", () => {
  const qs = generateVocabQuestions(WORDS, "hsk1", 6);
  for (const q of qs) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4, "đáp án phải khác nhau");
    assert.ok(q.correct >= 0 && q.correct < 4);
    const hanzi = q.id.replace("gen_hsk1_", "");
    const word = WORDS.find((w) => w.hanzi === hanzi)!;
    if (q.type === "meaning") {
      assert.equal(q.options[q.correct], word.meaning);
    } else {
      // choose_char và pinyin đều có đáp án là hanzi
      assert.equal(q.options[q.correct], word.hanzi);
    }
  }
});

test("xoay vòng 3 dạng meaning / choose_char / pinyin", () => {
  const qs = generateVocabQuestions(WORDS, "hsk1", 6);
  assert.equal(qs[0].type, "meaning");
  assert.equal(qs[1].type, "choose_char");
  assert.equal(qs[2].type, "pinyin");
  assert.equal(qs[3].type, "meaning");
});

test("dạng pinyin: câu hỏi chứa pinyin của từ đích", () => {
  const qs = generateVocabQuestions(WORDS, "hsk1", 6);
  const pq = qs[2];
  const hanzi = pq.id.replace("gen_hsk1_", "");
  const word = WORDS.find((w) => w.hanzi === hanzi)!;
  assert.ok(pq.question.includes(word.pinyin));
});

test("explanation chứa hanzi + nghĩa + Hán Việt", () => {
  const qs = generateVocabQuestions(WORDS, "hsk1", 2);
  for (const q of qs) {
    const hanzi = q.id.replace("gen_hsk1_", "");
    const word = WORDS.find((w) => w.hanzi === hanzi)!;
    assert.ok(q.explanation.includes(word.hanzi));
    assert.ok(q.explanation.includes(word.meaning));
    assert.ok(q.explanation.includes(word.hanViet!));
  }
});

test("kho < 4 từ → trả mảng rỗng (không crash)", () => {
  assert.deepEqual(generateVocabQuestions(WORDS.slice(0, 3), "hsk1", 5), []);
});

test("nghĩa trùng nhau bị khử (không sinh đáp án lặp)", () => {
  const dup: HSKWord[] = [
    ...WORDS,
    { hanzi: "他", pinyin: "tā", meaning: "Yêu" }, // nghĩa trùng với 爱
  ];
  const qs = generateVocabQuestions(dup, "hsk1", 7);
  for (const q of qs) {
    assert.equal(new Set(q.options).size, 4);
  }
});

test("count lớn hơn kho → chỉ trả tối đa số từ hợp lệ", () => {
  const qs = generateVocabQuestions(WORDS, "hsk1", 99);
  assert.equal(qs.length, WORDS.length);
});
