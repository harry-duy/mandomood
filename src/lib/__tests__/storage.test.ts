import { test } from "node:test";
import assert from "node:assert/strict";
import { readJSON, writeJSON } from "../utils";

/** Mock localStorage tối giản cho môi trường test (node). */
function mockStorage() {
  const map = new Map<string, string>();
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
      setItem: (k: string, v: string) => { map.set(k, v); },
      removeItem: (k: string) => { map.delete(k); },
    },
  };
  return map;
}

test("readJSON trả fallback khi key không tồn tại", () => {
  mockStorage();
  assert.deepEqual(readJSON("missing", [1, 2]), [1, 2]);
});

test("readJSON parse đúng giá trị hợp lệ", () => {
  const m = mockStorage();
  m.set("k", JSON.stringify({ a: 1 }));
  assert.deepEqual(readJSON("k", null), { a: 1 });
});

test("readJSON trả fallback & dọn key khi JSON hỏng", () => {
  const m = mockStorage();
  m.set("bad", "{not json");
  assert.deepEqual(readJSON("bad", "fb"), "fb");
  assert.equal(m.has("bad"), false); // đã tự dọn
});

test("writeJSON rồi readJSON round-trip", () => {
  mockStorage();
  writeJSON("rt", { x: [1, 2, 3] });
  assert.deepEqual(readJSON("rt", null), { x: [1, 2, 3] });
});
