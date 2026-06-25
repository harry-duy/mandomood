import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateBadges, countEarned, newlyUnlocked, earnedIds } from "../achievements";

test("không có gì → 0 huy hiệu đạt", () => {
  assert.equal(countEarned({}), 0);
});

test("1 truyện → đạt 'Khởi đầu'", () => {
  const earned = evaluateBadges({ storiesCreated: 1 }).filter((b) => b.isEarned).map((b) => b.id);
  assert.ok(earned.includes("first-story"));
});

test("streak 7 → đạt cả streak-3 và streak-7", () => {
  const earned = evaluateBadges({ streak: 7 }).filter((b) => b.isEarned).map((b) => b.id);
  assert.ok(earned.includes("streak-3"));
  assert.ok(earned.includes("streak-7"));
  assert.ok(!earned.includes("streak-30"));
});

test("đã đạt được sắp lên trước", () => {
  const list = evaluateBadges({ storiesCreated: 1, streak: 0 });
  assert.equal(list[0].isEarned, true);
});

test("pct kẹp trong 0..100", () => {
  for (const b of evaluateBadges({ storiesCreated: 999, streak: 999 })) {
    assert.ok(b.pct >= 0 && b.pct <= 100);
  }
});

test("newlyUnlocked chỉ trả huy hiệu chưa có trong prev", () => {
  const stats = { storiesCreated: 1, streak: 3 };
  const all = earnedIds(stats); // first-story + streak-3
  // prev đã có first-story → chỉ còn streak-3 là mới
  const fresh = newlyUnlocked(stats, ["first-story"]).map((b) => b.id);
  assert.deepEqual(fresh, ["streak-3"]);
  // nếu prev đã đủ → không có gì mới
  assert.equal(newlyUnlocked(stats, all).length, 0);
});

test("badge thi cu: test-10 va test-perfect", () => {
  const none = evaluateBadges({ testsTaken: 0, bestTestPct: 0 });
  assert.ok(!none.find((b) => b.id === "test-10")!.isEarned);
  assert.ok(!none.find((b) => b.id === "test-perfect")!.isEarned);

  const some = evaluateBadges({ testsTaken: 10, bestTestPct: 100 });
  assert.ok(some.find((b) => b.id === "test-10")!.isEarned);
  assert.ok(some.find((b) => b.id === "test-perfect")!.isEarned);

  // tien do 50% khi thi 5 lan
  const half = evaluateBadges({ testsTaken: 5 }).find((b) => b.id === "test-10")!;
  assert.equal(half.pct, 50);
});

test("badge tu vung: vocab-saver theo nguong 30/100/300", () => {
  const none = evaluateBadges({ wordsSaved: 0 });
  assert.ok(!none.find((b) => b.id === "vocab-saver-30")!.isEarned);

  // 30 tu -> dat moc dau, chua dat moc 100/300
  const m30 = evaluateBadges({ wordsSaved: 30 });
  assert.ok(m30.find((b) => b.id === "vocab-saver-30")!.isEarned);
  assert.ok(!m30.find((b) => b.id === "vocab-saver-100")!.isEarned);
  assert.ok(!m30.find((b) => b.id === "vocab-saver-300")!.isEarned);

  // 300 tu -> dat ca 3 moc
  const m300 = evaluateBadges({ wordsSaved: 300 });
  assert.ok(m300.find((b) => b.id === "vocab-saver-30")!.isEarned);
  assert.ok(m300.find((b) => b.id === "vocab-saver-100")!.isEarned);
  assert.ok(m300.find((b) => b.id === "vocab-saver-300")!.isEarned);

  // tien do 50% khi luu 15 tu (moc 30)
  const half = evaluateBadges({ wordsSaved: 15 }).find((b) => b.id === "vocab-saver-30")!;
  assert.equal(half.pct, 50);

  // pct kep 0..100 du luu rat nhieu
  for (const b of evaluateBadges({ wordsSaved: 9999 })) {
    assert.ok(b.pct >= 0 && b.pct <= 100);
  }
});
