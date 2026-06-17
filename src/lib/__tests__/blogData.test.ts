/**
 * Test toàn vẹn dữ liệu blog (BLOG_POSTS).
 * Bảo vệ các invariant để 1 lần sửa data lỗi không âm thầm làm hỏng /blog/[slug].
 * Chạy: npm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import { BLOG_POSTS } from "../blog-data";

test("blog: slug duy nhất (trùng → 1 bài không truy cập được)", () => {
  const slugs = BLOG_POSTS.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "Có slug blog bị trùng");
});

test("blog: slug đúng định dạng URL (chữ thường, số, gạch ngang)", () => {
  for (const p of BLOG_POSTS) {
    assert.match(p.slug, /^[a-z0-9-]+$/, `Slug không hợp lệ: "${p.slug}"`);
  }
});

test("blog: mọi bài có đủ trường bắt buộc + nội dung", () => {
  for (const p of BLOG_POSTS) {
    assert.ok(p.title?.trim(), `Thiếu title: ${p.slug}`);
    assert.ok(p.description?.trim(), `Thiếu description: ${p.slug}`);
    assert.match(p.date, /^\d{4}-\d{2}-\d{2}$/, `Date sai định dạng: ${p.slug}`);
    assert.ok(p.readMinutes > 0, `readMinutes phải > 0: ${p.slug}`);
    assert.ok(Array.isArray(p.tags) && p.tags.length > 0, `Thiếu tags: ${p.slug}`);
    assert.ok(p.sections.length > 0, `Bài rỗng (không section): ${p.slug}`);
    for (const s of p.sections) {
      assert.ok(s.heading?.trim(), `Section thiếu heading: ${p.slug}`);
      assert.ok(s.paragraphs.length > 0, `Section rỗng: ${p.slug} / ${s.heading}`);
    }
  }
});

test("blog: có ít nhất 10 bài (kho nội dung tối thiểu)", () => {
  assert.ok(BLOG_POSTS.length >= 10, `Chỉ có ${BLOG_POSTS.length} bài`);
});
