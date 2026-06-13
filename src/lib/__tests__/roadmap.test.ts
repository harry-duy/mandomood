import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRoadmap } from "../roadmap";

test("trả tối đa limit gợi ý, không trùng href", () => {
  const r = buildRoadmap({ goal: "fun", level: "hsk3", storiesCreated: 5 });
  assert.equal(r.length, 3);
  assert.equal(new Set(r.map((s) => s.href)).size, r.length);
});

test("người mới được ưu tiên nền tảng (radicals/pronunciation)", () => {
  const r = buildRoadmap({ goal: "fun", level: "beginner", storiesCreated: 5 });
  const hrefs = r.map((s) => s.href);
  assert.ok(hrefs.includes("/radicals"));
  assert.ok(hrefs.includes("/pronunciation"));
});

test("chưa tạo truyện nào → gợi ý tạo truyện đầu tiên", () => {
  const r = buildRoadmap({ goal: "business", level: "hsk4", storiesCreated: 0 });
  assert.ok(r.some((s) => s.href === "/generate"));
});

test("streak >= 3 → chèn thử thách giữ lửa", () => {
  const r = buildRoadmap({ goal: "drama", level: "hsk5", storiesCreated: 9, streak: 5 });
  assert.ok(r.some((s) => s.href === "/challenge"));
});

test("goal không hợp lệ → fallback sang fun", () => {
  const r = buildRoadmap({ goal: "xyz", level: "hsk2", storiesCreated: 3 });
  assert.equal(r.length, 3);
});
