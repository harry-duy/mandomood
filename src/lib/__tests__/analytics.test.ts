import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUtm } from "../analytics";

test("parseUtm: đủ 3 tham số", () => {
  const u = parseUtm("?utm_source=tiktok&utm_medium=video&utm_campaign=chiettu");
  assert.deepEqual(u, { source: "tiktok", medium: "video", campaign: "chiettu" });
});

test("parseUtm: không có dấu ? đứng đầu vẫn parse được", () => {
  const u = parseUtm("utm_source=facebook");
  assert.deepEqual(u, { source: "facebook" });
});

test("parseUtm: query rỗng → object rỗng", () => {
  assert.deepEqual(parseUtm(""), {});
  assert.deepEqual(parseUtm("?"), {});
});

test("parseUtm: bỏ qua tham số khác, không nhặt nhầm", () => {
  const u = parseUtm("?ref=abc&q=hello&utm_campaign=launch");
  assert.deepEqual(u, { campaign: "launch" });
});

test("parseUtm: giá trị rỗng/khoảng trắng bị loại", () => {
  assert.deepEqual(parseUtm("?utm_source=&utm_medium=%20"), {});
});

test("parseUtm: cắt giá trị quá dài về 100 ký tự", () => {
  const long = "x".repeat(300);
  const u = parseUtm(`?utm_source=${long}`);
  assert.equal(u.source?.length, 100);
});
