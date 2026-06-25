import { test } from "node:test";
import assert from "node:assert/strict";
import { LEVELS, levelFromXp, levelProgressPct } from "../levels";

test("LEVELS: ngưỡng tăng dần nghiêm ngặt, bắt đầu beginner=0", () => {
  assert.equal(LEVELS[0].key, "beginner");
  assert.equal(LEVELS[0].threshold, 0);
  for (let i = 1; i < LEVELS.length; i++) {
    assert.ok(LEVELS[i].threshold > LEVELS[i - 1].threshold, "phải tăng dần");
  }
});

test("levelFromXp: trả cấp cao nhất đạt được", () => {
  assert.equal(levelFromXp(0), "beginner");
  assert.equal(levelFromXp(99), "beginner");
  assert.equal(levelFromXp(100), "hsk1");
  assert.equal(levelFromXp(699), "hsk2");
  assert.equal(levelFromXp(700), "hsk3");
  assert.equal(levelFromXp(999999), "hsk6");
});

test("levelProgressPct: % trong dải cấp hiện tại", () => {
  // beginner band [0,100): 50 xp = 50%
  assert.equal(levelProgressPct(50, "beginner"), 50);
  // hsk1 band [100,300): 200 xp = (200-100)/(300-100) = 50%
  assert.equal(levelProgressPct(200, "hsk1"), 50);
  // đầu dải = 0%
  assert.equal(levelProgressPct(100, "hsk1"), 0);
  // hsk6 = cấp cao nhất → 100%
  assert.equal(levelProgressPct(6000, "hsk6"), 100);
  assert.equal(levelProgressPct(99999, "hsk6"), 100);
});

test("levelProgressPct: clamp 0..100 + cấp lạ coi như beginner", () => {
  assert.equal(levelProgressPct(-50, "hsk1"), 0);   // dưới ngưỡng → 0
  assert.equal(levelProgressPct(999, "hsk1"), 100); // vượt dải → clamp 100
  assert.ok(levelProgressPct(50, "unknown-level") >= 0); // không crash
});
