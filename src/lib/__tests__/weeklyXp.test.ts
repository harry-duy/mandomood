import { test } from "node:test";
import assert from "node:assert/strict";
import { effectiveWeeklyXp, nextMondayVN } from "../weeklyXp";

const NOW = new Date(2026, 5, 24, 10); // thứ Tư 2026-06-24
const future = new Date(2026, 5, 29); // thứ Hai kế tiếp (tương lai)
const past = new Date(2026, 5, 22); // thứ Hai tuần này đã qua (quá khứ)

test("reset ở tương lai → weekly_xp thuộc tuần hiện tại, giữ nguyên", () => {
  assert.equal(effectiveWeeklyXp(840, future, NOW), 840);
});

test("reset đã qua (tuần cũ) → coi như 0", () => {
  assert.equal(effectiveWeeklyXp(840, past, NOW), 0);
});

test("thiếu mốc reset → 0", () => {
  assert.equal(effectiveWeeklyXp(500, undefined, NOW), 0);
  assert.equal(effectiveWeeklyXp(500, null, NOW), 0);
});

test("weekly_xp = 0 hoặc không hợp lệ → 0", () => {
  assert.equal(effectiveWeeklyXp(0, future, NOW), 0);
  assert.equal(effectiveWeeklyXp(NaN, future, NOW), 0);
  assert.equal(effectiveWeeklyXp(-50, future, NOW), 0);
  assert.equal(effectiveWeeklyXp("abc", future, NOW), 0);
});

test("nhận reset dạng ISO string / number", () => {
  assert.equal(effectiveWeeklyXp(300, future.toISOString(), NOW), 300);
  assert.equal(effectiveWeeklyXp(300, future.getTime(), NOW), 300);
  assert.equal(effectiveWeeklyXp(300, "không-phải-ngày", NOW), 0);
});

test("đúng mốc biên: reset == now → đã sang tuần mới → 0", () => {
  assert.equal(effectiveWeeklyXp(700, new Date(NOW), NOW), 0);
});

test("nextMondayVN: trả về thứ Hai 00:00 GIỜ VN, luôn ở tương lai", () => {
  const now = new Date("2026-06-23T10:00:00Z"); // thứ Ba
  const r = nextMondayVN(now);
  const rVN = new Date(r.getTime() + 7 * 3600 * 1000); // đọc field UTC = giờ tường VN
  assert.equal(rVN.getUTCDay(), 1, "phải là thứ Hai theo giờ VN");
  assert.equal(rVN.getUTCHours(), 0);
  assert.equal(rVN.getUTCMinutes(), 0);
  assert.equal(rVN.getUTCSeconds(), 0);
  assert.ok(r.getTime() > now.getTime(), "phải ở tương lai");
  assert.ok(r.getTime() - now.getTime() <= 7 * 86400000, "trong vòng 7 ngày");
});

test("nextMondayVN: nếu đang là thứ Hai 00:00 VN → mốc kế tiếp là +7 ngày (giữ ngữ nghĩa cũ)", () => {
  const now = new Date("2026-06-23T10:00:00Z");
  const r = nextMondayVN(now);          // thứ Hai 00:00 VN kế tiếp
  const r2 = nextMondayVN(r);           // từ chính mốc đó → tuần sau
  assert.equal(r2.getTime() - r.getTime(), 7 * 86400000);
});

test("nextMondayVN: nửa đêm VN = 17:00 UTC chủ nhật hôm trước (đúng instant UTC)", () => {
  const r = nextMondayVN(new Date("2026-06-23T10:00:00Z"));
  // nửa đêm thứ Hai VN ⇔ 17:00 UTC chủ nhật
  assert.equal(r.getUTCHours(), 17);
  assert.equal(r.getUTCDay(), 0); // chủ nhật theo UTC
});
