import { test } from "node:test";
import assert from "node:assert/strict";
import { getPersonalizedMilestones, getMotivationalMessage } from "../learningPath";
import type { SkillScores } from "../skillScores";

const mk = (p: Partial<SkillScores> = {}): SkillScores => ({
  vocab: 0, listening: 0, speaking: 0, reading: 0, writing: 0, ...p,
});

test("getMotivationalMessage theo ngưỡng overall", () => {
  assert.match(getMotivationalMessage(0), /nghìn dặm/);
  assert.notEqual(getMotivationalMessage(10), getMotivationalMessage(50)); // khác nhánh
  assert.equal(getMotivationalMessage(100), getMotivationalMessage(85)); // cùng nhánh ≥80
});

test("getPersonalizedMilestones: tối đa 3, ô đầu priority 'high'", () => {
  const ms = getPersonalizedMilestones(mk());
  assert.ok(ms.length > 0 && ms.length <= 3);
  assert.equal(ms[0].priority, "high");
  for (const m of ms) assert.ok(["high", "medium", "low"].includes(m.priority));
});

test("kỹ năng đã CAO hết → không còn milestone nào (mọi ngưỡng đã vượt)", () => {
  const maxed = mk({ vocab: 100, listening: 100, speaking: 100, reading: 100, writing: 100 });
  assert.equal(getPersonalizedMilestones(maxed).length, 0);
});

test("ưu tiên kỹ năng YẾU nhất trước (vocab=0, còn lại cao → ô đầu là vocab)", () => {
  const scores = mk({ vocab: 0, listening: 90, speaking: 90, reading: 90, writing: 90 });
  const ms = getPersonalizedMilestones(scores);
  assert.ok(ms.length > 0);
  assert.equal(ms[0].skillKey, "vocab");
});

test("không trùng id milestone trong cùng kết quả", () => {
  const ms = getPersonalizedMilestones(mk({ vocab: 10, listening: 10, speaking: 10, reading: 10, writing: 10 }));
  const ids = ms.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});
