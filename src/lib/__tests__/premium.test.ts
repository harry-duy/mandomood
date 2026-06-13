import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isPaidActive, isTrialActive, premiumSource, hasPremiumAccess,
  daysLeft, trialEndDate, TRIAL_DAYS,
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
