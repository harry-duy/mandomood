import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePagination } from "../pagination";

test("mặc định khi thiếu tham số", () => {
  const p = parsePagination(null, null);
  assert.deepEqual(p, { page: 1, limit: 10, skip: 0 });
});

test("limit=0 → kẹp về 1 (chặn Mongo .limit(0) trả TẤT CẢ)", () => {
  assert.equal(parsePagination("1", "0").limit, 1);
});

test("limit quá lớn → kẹp về maxLimit", () => {
  assert.equal(parsePagination("1", "999999").limit, 50);
  assert.equal(parsePagination("1", "999999", { maxLimit: 20 }).limit, 20);
});

test("page âm / 0 → kẹp về 1, skip không âm", () => {
  assert.equal(parsePagination("0", "10").page, 1);
  assert.equal(parsePagination("-5", "10").page, 1);
  assert.equal(parsePagination("-5", "10").skip, 0);
});

test("tham số rác (NaN) → dùng mặc định", () => {
  const p = parsePagination("abc", "xyz");
  assert.equal(p.page, 1);
  assert.equal(p.limit, 10);
});

test("skip tính đúng theo page/limit", () => {
  assert.equal(parsePagination("3", "20").skip, 40);
  assert.equal(parsePagination("2", "10").skip, 10);
});

test("limit âm → kẹp về 1", () => {
  assert.equal(parsePagination("1", "-7").limit, 1);
});

test("tôn trọng defaultLimit tuỳ chọn", () => {
  assert.equal(parsePagination(null, null, { defaultLimit: 6 }).limit, 6);
});
