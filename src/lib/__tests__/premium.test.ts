import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isPaidActive, isTrialActive, premiumSource, hasPremiumAccess,
  daysLeft, trialEndDate, TRIAL_DAYS, premiumUntilForPlan,
  normalizePlan, VALID_PLANS, vnDateKey, toVnTime, vnDayStart,
} from "../premium";

const NOW = Date.parse("2026-06-12T12:00:00Z");
const DAY = 86_400_000;

test("paid: premium=true không có hạn (lifetime) → active", () => {
  assert.equal(isPaidActive({ premium: true, premium_until: null }, NOW), true);
});

test("paid: premium_until tương lai → active; quá khứ → hết (fix bug hết hạn vẫn premium)", () => {
  assert.equal(isPaidActive({ premium: true, premium_until: new Date(NOW + DAY) }, NOW), true);
  assert.equal(isPaidActive({ premium: true, premium_until: new Date(NOW - DAY) }, NOW), false);
});

test("paid: premium=false → không active dù có premium_until", () => {
  assert.equal(isPaidActive({ premium: false, premium_until: new Date(NOW + DAY) }, NOW), false);
});

test("trial: còn hạn → active; hết hạn/không có → không", () => {
  assert.equal(isTrialActive({ trial_until: new Date(NOW + DAY) }, NOW), true);
  assert.equal(isTrialActive({ trial_until: new Date(NOW - 1) }, NOW), false);
  assert.equal(isTrialActive({}, NOW), false);
});

test("premiumSource: paid ưu tiên hơn trial; free khi hết cả hai", () => {
  assert.equal(premiumSource({ premium: true, premium_until: null, trial_until: new Date(NOW + DAY) }, NOW), "paid");
  assert.equal(premiumSource({ premium: false, trial_until: new Date(NOW + DAY) }, NOW), "trial");
  assert.equal(premiumSource({ premium: false, trial_until: new Date(NOW - DAY) }, NOW), null);
});

test("hasPremiumAccess: trial hết → false (khóa lại, mời mua)", () => {
  assert.equal(hasPremiumAccess({ premium: false, trial_until: new Date(NOW - 1) }, NOW), false);
  assert.equal(hasPremiumAccess({ premium: false, trial_until: new Date(NOW + 1) }, NOW), true);
});

test("daysLeft: làm tròn lên, 0 khi hết", () => {
  assert.equal(daysLeft(new Date(NOW + 1), NOW), 1);          // còn 1ms vẫn là 1 ngày
  assert.equal(daysLeft(new Date(NOW + 30 * DAY), NOW), 30);
  assert.equal(daysLeft(new Date(NOW - 1), NOW), 0);
  assert.equal(daysLeft(null, NOW), 0);
});

test("trialEndDate: đúng TRIAL_DAYS ngày", () => {
  assert.equal(trialEndDate(NOW).getTime(), NOW + TRIAL_DAYS * DAY);
});

test("nhận cả Date string (từ JSON/lean)", () => {
  assert.equal(isTrialActive({ trial_until: new Date(NOW + DAY).toISOString() }, NOW), true);
  assert.equal(isPaidActive({ premium: true, premium_until: "invalid-date" }, NOW), false);
});

test("premiumUntilForPlan: monthly +1 tháng, yearly +1 năm, lifetime null", () => {
  const from = new Date("2026-06-16T00:00:00Z");
  const m = premiumUntilForPlan("monthly", from)!;
  assert.equal(m.getMonth(), (from.getMonth() + 1) % 12);
  const y = premiumUntilForPlan("yearly", from)!;
  assert.equal(y.getFullYear(), from.getFullYear() + 1);
  assert.equal(premiumUntilForPlan("lifetime", from), null);
  // giá trị lạ → mặc định monthly (an toàn chi phí)
  const unknown = premiumUntilForPlan("???", from)!;
  assert.equal(unknown.getMonth(), (from.getMonth() + 1) % 12);
  // không đột biến tham số from
  assert.equal(from.toISOString(), "2026-06-16T00:00:00.000Z");
});

test("normalizePlan: chấp nhận đúng 3 gói hợp lệ", () => {
  assert.equal(normalizePlan("monthly"), "monthly");
  assert.equal(normalizePlan("yearly"), "yearly");
  assert.equal(normalizePlan("lifetime"), "lifetime");
  assert.deepEqual([...VALID_PLANS], ["monthly", "yearly", "lifetime"]);
});

test("normalizePlan: chặn giá trị lạ/sai kiểu → null (chống ép entitlement)", () => {
  assert.equal(normalizePlan("free"), null);
  assert.equal(normalizePlan("YEARLY"), null); // phân biệt hoa thường
  assert.equal(normalizePlan(""), null);
  assert.equal(normalizePlan(undefined), null);
  assert.equal(normalizePlan(null), null);
  assert.equal(normalizePlan(123), null);
  assert.equal(normalizePlan({ plan: "yearly" }), null);
});

test("vnDateKey: trả ngày theo giờ VN (UTC+7), KHÔNG phải UTC", () => {
  // 16:30 UTC 2026-06-24 = 23:30 VN cùng ngày
  assert.equal(vnDateKey(new Date("2026-06-24T16:30:00Z")), "2026-06-24");
  // 17:30 UTC 2026-06-24 = 00:30 VN ngày 25 → đã sang ngày mới ở VN
  assert.equal(vnDateKey(new Date("2026-06-24T17:30:00Z")), "2026-06-25");
  // 23:00 UTC = 06:00 VN hôm sau
  assert.equal(vnDateKey(new Date("2026-06-24T23:00:00Z")), "2026-06-25");
  // đầu ngày UTC vẫn là cùng ngày VN (07:00 VN)
  assert.equal(vnDateKey(new Date("2026-06-25T00:00:00Z")), "2026-06-25");
});

test("toVnTime: dịch đúng +7h so với UTC (phục vụ so ngày streak theo giờ VN)", () => {
  const utc = new Date("2026-06-24T17:30:00Z");
  const vn = toVnTime(utc);
  assert.equal(vn.getTime() - utc.getTime(), 7 * 3600 * 1000);
  // 17:30 UTC + 7h = 00:30 hôm sau (đọc theo UTC field = giờ tường VN trên server UTC)
  assert.equal(vn.toISOString(), "2026-06-25T00:30:00.000Z");
});

test("vnDayStart: trả nửa đêm VN của ngày chứa now (instant UTC = 17:00 hôm trước)", () => {
  // 09:00 VN ngày 25 (=02:00Z ngày 25) → nửa đêm VN ngày 25 = 17:00Z ngày 24
  const r = vnDayStart(new Date("2026-06-25T02:00:00Z"));
  assert.equal(r.toISOString(), "2026-06-24T17:00:00.000Z");
  // đọc theo giờ VN (UTC field của +7h) phải là 00:00 ngày 25
  const rVN = new Date(r.getTime() + 7 * 3600 * 1000);
  assert.equal(rVN.getUTCHours(), 0);
  assert.equal(rVN.getUTCDate(), 25);
});

test("vnDayStart: 23:30 VN vẫn cùng ngày VN (không nhảy sang hôm sau)", () => {
  // 23:30 VN ngày 24 = 16:30Z ngày 24 → nửa đêm VN ngày 24 = 17:00Z ngày 23
  const r = vnDayStart(new Date("2026-06-24T16:30:00Z"));
  assert.equal(r.toISOString(), "2026-06-23T17:00:00.000Z");
});
