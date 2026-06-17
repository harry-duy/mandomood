/**
 * Test adminUserFilter — dựng query lọc user (admin). Chạy: npm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import { buildUserFilter, escapeRegex, isValidTier, isValidLevel } from "../adminUserFilter";

const NOW = new Date("2026-06-16T12:00:00Z");

test("escapeRegex: escape ký tự đặc biệt", () => {
  assert.equal(escapeRegex("a.b*c"), "a\\.b\\*c");
  assert.equal(escapeRegex("x(y)"), "x\\(y\\)");
});

test("isValidTier / isValidLevel", () => {
  assert.equal(isValidTier("premium"), true);
  assert.equal(isValidTier("vip"), false);
  assert.equal(isValidLevel("hsk3"), true);
  assert.equal(isValidLevel("hsk9"), false);
  assert.equal(isValidLevel(123), false);
});

test("không tiêu chí → query rỗng, active=false", () => {
  const { query, active } = buildUserFilter({}, NOW);
  assert.deepEqual(query, {});
  assert.equal(active, false);
});

test("q < 2 ký tự → bỏ qua, không active", () => {
  const { active } = buildUserFilter({ q: "a" }, NOW);
  assert.equal(active, false);
});

test("q hợp lệ → $or name/email regex, active", () => {
  const { query, active } = buildUserFilter({ q: "duy" }, NOW);
  assert.equal(active, true);
  const or = (query as { $or: { name?: RegExp; email?: RegExp }[] }).$or;
  assert.ok(or[0].name instanceof RegExp);
  assert.ok(or[1].email instanceof RegExp);
});

test("tier=premium → $or premium/premium_until", () => {
  const { query, active } = buildUserFilter({ tier: "premium" }, NOW);
  assert.equal(active, true);
  assert.deepEqual(query, { $or: [{ premium: true }, { premium_until: { $gt: NOW } }] });
});

test("tier=free → $nor premium/premium_until/trial_until", () => {
  const { query } = buildUserFilter({ tier: "free" }, NOW);
  assert.deepEqual(query, { $nor: [{ premium: true }, { premium_until: { $gt: NOW } }, { trial_until: { $gt: NOW } }] });
});

test("tier=trial → trial active + không premium ($and)", () => {
  const { query } = buildUserFilter({ tier: "trial" }, NOW);
  const and = (query as { $and: unknown[] }).$and;
  assert.equal(and.length, 2);
  assert.deepEqual(and[0], { trial_until: { $gt: NOW } });
});

test("tier không hợp lệ → bỏ qua", () => {
  const { active } = buildUserFilter({ tier: "vip" }, NOW);
  assert.equal(active, false);
});

test("kết hợp q + level → $and 2 điều kiện", () => {
  const { query, active } = buildUserFilter({ q: "an", level: "hsk2" }, NOW);
  assert.equal(active, true);
  const and = (query as { $and: unknown[] }).$and;
  assert.equal(and.length, 2);
  assert.deepEqual(and[1], { level: "hsk2" });
});

test("level không hợp lệ → bỏ qua", () => {
  const { query, active } = buildUserFilter({ level: "hsk99" }, NOW);
  assert.deepEqual(query, {});
  assert.equal(active, false);
});
