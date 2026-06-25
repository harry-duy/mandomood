import { test } from "node:test";
import assert from "node:assert/strict";
import { getDemoPosts, DEMO_POSTS_STATIC } from "../communityDemo";

test("trả tối đa count bài, mặc định 12", () => {
  assert.equal(getDemoPosts().length, 12);
  assert.equal(getDemoPosts({ count: 5 }).length, 5);
});

test("lọc theo mood → mọi bài đúng mood đó", () => {
  const healing = getDemoPosts({ mood: "healing", count: 50 });
  assert.ok(healing.length > 0);
  assert.ok(healing.every((p) => p.mood === "healing"));
});

test("mood không có bài → fallback toàn kho (không rỗng)", () => {
  const none = getDemoPosts({ mood: "khong-ton-tai", count: 50 });
  assert.ok(none.length > 0);
});

test("created_at giảm dần (mới → cũ) để sort 'mới' hợp lý", () => {
  const posts = getDemoPosts({ count: 12 });
  for (let i = 1; i < posts.length; i++) {
    assert.ok(
      new Date(posts[i - 1].created_at).getTime() >= new Date(posts[i].created_at).getTime()
    );
  }
});

test("mỗi bài có đủ field bắt buộc + _id duy nhất trong kết quả", () => {
  const posts = getDemoPosts({ count: 50 });
  const ids = new Set<string>();
  for (const p of posts) {
    assert.ok(p._id && p.author_name && p.chinese_text && p.translation);
    assert.equal(typeof p.like_count, "number");
    assert.ok(Array.isArray(p.likes));
    assert.ok(!ids.has(p._id)); // không lặp bài trong cùng kết quả
    ids.add(p._id);
  }
});

test("trộn ngẫu nhiên: nhiều lần gọi cho thứ tự khác nhau (xác suất rất cao)", () => {
  const a = getDemoPosts({ count: 12 }).map((p) => p._id).join(",");
  let different = false;
  for (let i = 0; i < 8; i++) {
    const b = getDemoPosts({ count: 12 }).map((p) => p._id).join(",");
    if (b !== a) { different = true; break; }
  }
  assert.ok(different);
});

test("DEMO_POSTS_STATIC ổn định, không rỗng (dùng cho SSR)", () => {
  assert.ok(DEMO_POSTS_STATIC.length > 0);
  assert.equal(DEMO_POSTS_STATIC[0]._id, DEMO_POSTS_STATIC[0]._id);
});

test("sort 'hot' → like_count KHÔNG tăng dần (xếp theo lượt thích)", () => {
  const hot = getDemoPosts({ count: 12, sort: "hot" });
  for (let i = 1; i < hot.length; i++) {
    assert.ok(hot[i - 1].like_count >= hot[i].like_count);
  }
});

test("sort mặc định 'new' → created_at giảm dần (không phải theo like)", () => {
  const fresh = getDemoPosts({ count: 12 });
  for (let i = 1; i < fresh.length; i++) {
    assert.ok(new Date(fresh[i - 1].created_at).getTime() >= new Date(fresh[i].created_at).getTime());
  }
});
