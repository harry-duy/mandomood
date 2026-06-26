import { test } from "node:test";
import assert from "node:assert/strict";
import { getAdminEmails, isAdminEmail } from "../adminAuth";

test("getAdminEmails: tách + trim + lowercase + bỏ rỗng", () => {
  assert.deepEqual(
    getAdminEmails(" A@X.com , b@y.com ,, C@Z.COM "),
    ["a@x.com", "b@y.com", "c@z.com"]
  );
});

test("getAdminEmails: env undefined → dùng admin mặc định; '' → [] (giữ đúng ngữ nghĩa ?? như route gốc)", () => {
  assert.deepEqual(getAdminEmails(undefined), ["ngothanhduy04@gmail.com"]);
  // chuỗi rỗng KHÔNG phải null nên ?? giữ "" → split → [""] → filter → [] (không có admin)
  assert.deepEqual(getAdminEmails(""), []);
});

test("isAdminEmail: so sánh KHÔNG phân biệt hoa thường (vá lỗi lệch giữa các route)", () => {
  const env = "Admin@Gmail.com";
  assert.equal(isAdminEmail("admin@gmail.com", env), true);  // session lowercase
  assert.equal(isAdminEmail("ADMIN@GMAIL.COM", env), true);  // session uppercase
  assert.equal(isAdminEmail("  Admin@Gmail.com  ", env), true); // có khoảng trắng
});

test("isAdminEmail: email không thuộc danh sách → false", () => {
  const env = "admin@x.com,boss@y.com";
  assert.equal(isAdminEmail("hacker@z.com", env), false);
  assert.equal(isAdminEmail("", env), false);
  assert.equal(isAdminEmail(null, env), false);
  assert.equal(isAdminEmail(undefined, env), false);
});

test("isAdminEmail: nhiều admin trong env", () => {
  const env = "a@x.com, b@y.com, c@z.com";
  assert.equal(isAdminEmail("b@y.com", env), true);
  assert.equal(isAdminEmail("c@z.com", env), true);
  assert.equal(isAdminEmail("d@w.com", env), false);
});
