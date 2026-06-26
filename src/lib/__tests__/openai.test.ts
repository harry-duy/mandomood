import { test } from "node:test";
import assert from "node:assert/strict";
import { repairModelJson, sanitizeGrade, sanitizeAnalyzed, type GradeResult, type AnalyzedContent } from "../openai";

// ─── repairModelJson: chịu lỗi output model (fence / text thừa / dấu phẩy cuối / truncate) ───
test("repairModelJson: parse JSON sạch trực tiếp", () => {
  assert.deepEqual(repairModelJson<{ a: number }>('{"a":1}'), { a: 1 });
});

test("repairModelJson: bỏ markdown fence ```json", () => {
  assert.deepEqual(repairModelJson<{ a: number }>("```json\n{\"a\":1}\n```"), { a: 1 });
});

test("repairModelJson: trích object khi có text thừa quanh JSON", () => {
  assert.deepEqual(
    repairModelJson<{ a: number }>("Here is the result: {\"a\":1} thanks"),
    { a: 1 }
  );
});

test("repairModelJson: sửa dấu phẩy cuối (trailing comma) trước } và ]", () => {
  assert.deepEqual(
    repairModelJson<{ a: number; b: number[] }>("{\"a\":1,\"b\":[2,3,],}"),
    { a: 1, b: [2, 3] }
  );
});

test("repairModelJson: ném lỗi rõ ràng khi không có object JSON nào", () => {
  assert.throws(() => repairModelJson("xin chào không có json"), /no JSON object/);
});

// ─── sanitizeGrade: làm cứng điểm chấm AI trước khi tới UI ───
test("sanitizeGrade: kẹp score >100 về 100", () => {
  const r = sanitizeGrade({ score: 9999, correct: true } as unknown as GradeResult);
  assert.equal(r.score, 100);
});

test("sanitizeGrade: kẹp score âm về 0", () => {
  const r = sanitizeGrade({ score: -50, correct: false } as unknown as GradeResult);
  assert.equal(r.score, 0);
});

test("sanitizeGrade: score NaN/không hợp lệ → 0", () => {
  const r = sanitizeGrade({ score: NaN, correct: false } as unknown as GradeResult);
  assert.equal(r.score, 0);
});

test("sanitizeGrade: làm tròn score thập phân", () => {
  const r = sanitizeGrade({ score: 87.6, correct: false } as unknown as GradeResult);
  assert.equal(r.score, 88);
});

test("sanitizeGrade: correct ép về boolean nghiêm ngặt (chuỗi 'yes' → false)", () => {
  const r = sanitizeGrade({ score: 80, correct: "yes" } as unknown as GradeResult);
  assert.equal(r.correct, false);
  const r2 = sanitizeGrade({ score: 100, correct: true } as unknown as GradeResult);
  assert.equal(r2.correct, true);
});

test("sanitizeGrade: errors không phải mảng → [] và feedback/suggestion ép về chuỗi", () => {
  const r = sanitizeGrade({
    score: 50,
    correct: false,
    errors: null,
    feedback: 123,
    suggestion: undefined,
  } as unknown as GradeResult);
  assert.deepEqual(r.errors, []);
  assert.equal(r.feedback, "");
  assert.equal(r.suggestion, "");
});

// ─── sanitizeAnalyzed: làm cứng hình dạng nội dung AI (chống crash client) ───
test("sanitizeAnalyzed: vocabulary/exercises thiếu/không phải mảng → []", () => {
  const r = sanitizeAnalyzed({} as unknown as AnalyzedContent);
  assert.deepEqual(r.vocabulary, []);
  assert.deepEqual(r.exercises, []);
  assert.equal(r.level, "hsk2"); // mặc định an toàn
  assert.equal(typeof r.summary, "string");
});

test("sanitizeAnalyzed: ép kiểu phần tử vocab + bỏ field rác", () => {
  const r = sanitizeAnalyzed({
    vocabulary: [{ hanzi: "爱", pinyin: 123, meaning: "yêu" }],
  } as unknown as AnalyzedContent);
  assert.equal(r.vocabulary.length, 1);
  assert.equal(r.vocabulary[0].hanzi, "爱");
  assert.equal(r.vocabulary[0].pinyin, ""); // số → ""
  assert.equal(r.vocabulary[0].meaning, "yêu");
});

test("sanitizeAnalyzed: exercise type lạ → translate_to_viet; id thiếu → ex<n>", () => {
  const r = sanitizeAnalyzed({
    exercises: [{ type: "hack", question: "q" }, { type: "pinyin", question: "p", answer: "a" }],
  } as unknown as AnalyzedContent);
  assert.equal(r.exercises[0].type, "translate_to_viet");
  assert.equal(r.exercises[0].id, "ex1");
  assert.equal(r.exercises[1].type, "pinyin");
});

test("sanitizeAnalyzed: cap số lượng (≤20) + options (≤8)", () => {
  const r = sanitizeAnalyzed({
    vocabulary: Array.from({ length: 50 }, () => ({ hanzi: "x" })),
    exercises: [{ type: "multiple_choice", question: "q", answer: "a",
      options: Array.from({ length: 20 }, (_, i) => `o${i}`) }],
  } as unknown as AnalyzedContent);
  assert.equal(r.vocabulary.length, 20);
  assert.equal(r.exercises[0].options?.length, 8);
});
