/**
 * Test mergeSync — merge cloud↔local không mất tiến độ.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizePayload,
  mergeSavedWords,
  mergeDecks,
  mergeStories,
  mergeQuizBest,
  mergeBadges,
  mergeSyncPayload,
  mergePassages,
  fitPayload,
  stableHash,
  EMPTY_SYNC,
  type SyncCard,
  type SyncDeck,
  mergeTestResults,
} from "../mergeSync";

const card = (id: string, repetitions = 0, due = "2026-01-01"): SyncCard => ({
  id, front: "你", back: "ban", easeFactor: 2.5, interval: 1, repetitions, due,
});
const deck = (id: string, name: string, cards: SyncCard[]): SyncDeck => ({
  id, name, emoji: "📚", cards, createdAt: "2026-01-01",
});

// ── sanitizePayload ───────────────────────────────────────────────────────────
test("sanitizePayload: rac/thieu truong → payload an toan", () => {
  const p = sanitizePayload({ savedWords: [{ hanzi: "你" }, { x: 1 }, null], hskQuizBest: { "1": 250, "2": "x", "3": 77.6 }, badges: ["a", 5] });
  assert.equal(p.savedWords.length, 1);
  assert.deepEqual(p.hskQuizBest, { "1": 100, "3": 78 }); // clamp 0..100, lam tron
  assert.deepEqual(p.badges, ["a"]);
  assert.deepEqual(p.customDecks, []);
});

test("sanitizePayload: null/undefined → EMPTY", () => {
  assert.deepEqual(sanitizePayload(null), EMPTY_SYNC);
  assert.deepEqual(sanitizePayload(undefined), EMPTY_SYNC);
  assert.deepEqual(sanitizePayload("abc"), EMPTY_SYNC);
});

// ── mergeSavedWords ───────────────────────────────────────────────────────────
test("mergeSavedWords: union theo hanzi, giu addedAt muon nhat (re-add thang tombstone)", () => {
  const a = [{ hanzi: "你", pinyin: "ni", meaning: "ban", addedAt: "2026-01-02T00:00:00Z" }];
  const b = [
    { hanzi: "你", pinyin: "ni", meaning: "ban", addedAt: "2026-01-01T00:00:00Z" },
    { hanzi: "好", pinyin: "hao", meaning: "tot", addedAt: "2026-01-03T00:00:00Z" },
  ];
  const m = mergeSavedWords(a, b);
  assert.equal(m.length, 2);
  assert.equal(m.find((w) => w.hanzi === "你")!.addedAt, "2026-01-02T00:00:00Z");
  assert.equal(m[0].hanzi, "好"); // sap xep moi nhat truoc
});

// ── mergeDecks ────────────────────────────────────────────────────────────────
test("mergeDecks: union deck + union card, xung dot giu the co repetitions cao hon", () => {
  const server = [deck("d1", "Bo cu", [card("c1", 3, "2026-02-01"), card("c2", 1)])];
  const client = [
    deck("d1", "Bo cu (doi ten)", [card("c1", 1, "2026-03-01"), card("c3", 0)]),
    deck("d2", "Bo moi", [card("c4")]),
  ];
  const m = mergeDecks(server, client);
  assert.equal(m.length, 2);
  const d1 = m.find((d) => d.id === "d1")!;
  assert.equal(d1.cards.length, 3); // c1, c2, c3
  assert.equal(d1.cards.find((c) => c.id === "c1")!.repetitions, 3); // giu tien do xa hon
});

test("mergeDecks: hai phia khong trung → giu ca hai", () => {
  const m = mergeDecks([deck("a", "A", [])], [deck("b", "B", [card("x")])]);
  assert.equal(m.length, 2);
});

// ── mergeStories ──────────────────────────────────────────────────────────────
test("mergeStories: union theo id, moi nhat truoc, cap 50", () => {
  const a = Array.from({ length: 30 }, (_, i) => ({ id: `a${i}`, createdAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}` }));
  const b = Array.from({ length: 30 }, (_, i) => ({ id: `b${i}`, createdAt: `2026-02-${String((i % 28) + 1).padStart(2, "0")}` }));
  const m = mergeStories(a, b);
  assert.equal(m.length, 50);
  assert.ok(m[0].createdAt >= m[1].createdAt);
});

test("mergeStories: id trung khong bi nhan doi", () => {
  const s = { id: "s1", createdAt: "2026-01-01" };
  assert.equal(mergeStories([s], [{ ...s }]).length, 1);
});

// ── mergeQuizBest / mergeBadges ───────────────────────────────────────────────
test("mergeQuizBest: lay max tung level", () => {
  assert.deepEqual(mergeQuizBest({ "1": 80, "2": 50 }, { "2": 90, "3": 70 }), { "1": 80, "2": 90, "3": 70 });
});

test("mergeBadges: union khong trung", () => {
  assert.deepEqual(mergeBadges(["a", "b"], ["b", "c"]), ["a", "b", "c"]);
});

// ── Tombstone (xóa thật qua thiết bị) ─────────────────────────────────────────
test("tombstone: xoa tu o may A → sync → tu bien mat du may B con giu", () => {
  const server = {
    ...EMPTY_SYNC,
    savedWords: [{ hanzi: "云", pinyin: "yun", meaning: "may", addedAt: "2026-01-01T00:00:00Z" }],
  };
  const client = {
    ...EMPTY_SYNC,
    deleted: { ...EMPTY_SYNC.deleted, words: { "云": "2026-01-05T00:00:00Z" }, decks: {} },
  };
  const m = mergeSyncPayload(server, client);
  assert.equal(m.savedWords.length, 0, "tu da xoa phai bien mat");
  assert.equal(m.deleted.words["云"], "2026-01-05T00:00:00Z", "tombstone phai duoc giu lai");
});

test("tombstone: them LAI tu sau khi xoa → tu song lai", () => {
  const server = {
    ...EMPTY_SYNC,
    deleted: { ...EMPTY_SYNC.deleted, words: { "云": "2026-01-05T00:00:00Z" }, decks: {} },
  };
  const client = {
    ...EMPTY_SYNC,
    savedWords: [{ hanzi: "云", pinyin: "yun", meaning: "may", addedAt: "2026-01-10T00:00:00Z" }],
  };
  const m = mergeSyncPayload(server, client);
  assert.equal(m.savedWords.length, 1, "tu them lai sau khi xoa phai song");
});

test("tombstone: xoa deck lan qua thiet bi, deck tao SAU khi xoa van song", () => {
  const oldDeck = deck("d1", "Cu", [card("c1")]); // createdAt 2026-01-01
  const newDeck = { ...deck("d2", "Moi", []), createdAt: "2026-03-01" };
  const server = { ...EMPTY_SYNC, customDecks: [oldDeck, newDeck] };
  const client = {
    ...EMPTY_SYNC,
    deleted: { ...EMPTY_SYNC.deleted, words: {}, decks: { d1: "2026-02-01T00:00:00Z", d2: "2026-02-01T00:00:00Z" } },
  };
  const m = mergeSyncPayload(server, client);
  assert.deepEqual(m.customDecks.map((d) => d.id), ["d2"], "d1 xoa, d2 tao sau tombstone → song");
});

test("tombstone: hai may cung xoa → giu thoi diem muon nhat", () => {
  const a = { ...EMPTY_SYNC, deleted: { ...EMPTY_SYNC.deleted, words: { "云": "2026-01-01T00:00:00Z" }, decks: {} } };
  const b = { ...EMPTY_SYNC, deleted: { ...EMPTY_SYNC.deleted, words: { "云": "2026-01-09T00:00:00Z" }, decks: {} } };
  const m = mergeSyncPayload(a, b);
  assert.equal(m.deleted.words["云"], "2026-01-09T00:00:00Z");
});

test("sanitize tombstone: gia tri khong phai ISO date bi loai", () => {
  const p = sanitizePayload({ deleted: { ...EMPTY_SYNC.deleted, words: { a: "2026-01-01", b: "khong-phai-date", c: 5 }, decks: "x" } });
  assert.deepEqual(Object.keys(p.deleted.words), ["a"]);
  assert.deepEqual(p.deleted.decks, {});
});

// ── Tombstone cấp THẺ + TRUYỆN (chặn theo id) ─────────────────────────────────
test("tombstone card: xoa 1 the le → the bien mat khoi deck sau merge, deck van con", () => {
  const server = { ...EMPTY_SYNC, customDecks: [deck("d1", "A", [card("c1", 2), card("c2", 1)])] };
  const client = {
    ...EMPTY_SYNC,
    deleted: { ...EMPTY_SYNC.deleted, cards: { c1: "2026-02-01T00:00:00Z" } },
  };
  const m = mergeSyncPayload(server, client);
  assert.equal(m.customDecks.length, 1);
  assert.deepEqual(m.customDecks[0].cards.map((c) => c.id), ["c2"]);
});

test("tombstone story: xoa het lich su o may A → truyen khong quay lai tu cloud", () => {
  const server = {
    ...EMPTY_SYNC,
    storyHistory: [
      { id: "s1", createdAt: "2026-01-01" },
      { id: "s2", createdAt: "2026-01-02" },
    ],
  };
  const client = {
    ...EMPTY_SYNC,
    deleted: { ...EMPTY_SYNC.deleted, stories: { s1: "2026-02-01T00:00:00Z", s2: "2026-02-01T00:00:00Z" } },
  };
  const m = mergeSyncPayload(server, client);
  assert.equal(m.storyHistory.length, 0);
  // truyen MOI tao sau do (id moi) khong bi anh huong
  const m2 = mergeSyncPayload(m, { ...EMPTY_SYNC, storyHistory: [{ id: "s3", createdAt: "2026-03-01" }] });
  assert.deepEqual(m2.storyHistory.map((s) => s.id), ["s3"]);
});

// ── customPassages (thư viện đọc) ─────────────────────────────────────────────
test("mergePassages: union theo id, ban savedAt muon nhat thang", () => {
  const a = [{ id: "p1", savedAt: "2026-01-01", title: "cu" }];
  const b = [
    { id: "p1", savedAt: "2026-02-01", title: "moi" },
    { id: "p2", savedAt: "2026-01-15" },
  ];
  const m = mergePassages(a, b);
  assert.equal(m.length, 2);
  assert.equal(m.find((p) => p.id === "p1")!.title, "moi");
});

test("tombstone passage: xoa doan doc → mat sau sync; LUU LAI sau khi xoa → song", () => {
  const server = {
    ...EMPTY_SYNC,
    customPassages: [{ id: "p1", savedAt: "2026-01-01T00:00:00Z" }],
  };
  const client = {
    ...EMPTY_SYNC,
    deleted: { ...EMPTY_SYNC.deleted, passages: { p1: "2026-01-05T00:00:00Z" } },
  };
  const m = mergeSyncPayload(server, client);
  assert.equal(m.customPassages.length, 0, "doan da xoa phai mat");
  // luu lai CUNG id sau thoi diem xoa → song lai
  const reAdd = {
    ...EMPTY_SYNC,
    customPassages: [{ id: "p1", savedAt: "2026-01-10T00:00:00Z" }],
  };
  const m2 = mergeSyncPayload(m, reAdd);
  assert.equal(m2.customPassages.length, 1, "luu lai sau khi xoa phai song");
});

test("tombstone passage: ban cu KHONG co savedAt → tombstone thang (an toan)", () => {
  const server = { ...EMPTY_SYNC, customPassages: [{ id: "p1" }] };
  const client = {
    ...EMPTY_SYNC,
    deleted: { ...EMPTY_SYNC.deleted, passages: { p1: "2026-01-05T00:00:00Z" } },
  };
  assert.equal(mergeSyncPayload(server, client).customPassages.length, 0);
});

// ── fitPayload (chống vượt 256KB) ─────────────────────────────────────────────
test("fitPayload: duoi nguong → giu nguyen", () => {
  const p = { ...EMPTY_SYNC, badges: ["a"] };
  assert.deepEqual(fitPayload(p, 10_000), p);
});

test("fitPayload: vuot nguong → bo dan truyen CU nhat, tien do hoc giu nguyen", () => {
  const big = "x".repeat(3000);
  const stories = Array.from({ length: 10 }, (_, i) => ({
    id: `s${i}`,
    createdAt: `2026-01-${String(i + 1).padStart(2, "0")}`,
    content: big,
  }));
  const p = {
    ...EMPTY_SYNC,
    storyHistory: stories,
    savedWords: [{ hanzi: "你", pinyin: "ni", meaning: "ban", addedAt: "2026-01-01" }],
    hskQuizBest: { "1": 90 },
  };
  const fitted = fitPayload(p, 10_000);
  assert.ok(JSON.stringify(fitted).length <= 10_000, "phai co ve duoi nguong");
  assert.ok(fitted.storyHistory.length < 10 && fitted.storyHistory.length > 0);
  // truyen MOI nhat duoc giu, cu nhat bi bo
  assert.ok(fitted.storyHistory.some((s) => s.id === "s9"));
  assert.ok(!fitted.storyHistory.some((s) => s.id === "s0"));
  // tien do hoc khong bi dung den
  assert.equal(fitted.savedWords.length, 1);
  assert.deepEqual(fitted.hskQuizBest, { "1": 90 });
});

// ── stableHash (badge "chưa sync") ────────────────────────────────────────────
test("stableHash: cung payload → cung hash; payload khac → hash khac", () => {
  const a = { ...EMPTY_SYNC, badges: ["x"] };
  const b = { ...EMPTY_SYNC, badges: ["x"] };
  const c = { ...EMPTY_SYNC, badges: ["y"] };
  assert.equal(stableHash(a), stableHash(b));
  assert.notEqual(stableHash(a), stableHash(c));
  assert.notEqual(stableHash(EMPTY_SYNC), stableHash(c));
});

// ── mergeSyncPayload ──────────────────────────────────────────────────────────
test("mergeSyncPayload: khong mat du lieu o ca hai phia (round-trip)", () => {
  const server = {
    ...EMPTY_SYNC,
    savedWords: [{ hanzi: "云", pinyin: "yun", meaning: "may", addedAt: "2026-01-01" }],
    hskQuizBest: { "1": 90 },
  };
  const client = {
    ...EMPTY_SYNC,
    savedWords: [{ hanzi: "山", pinyin: "shan", meaning: "nui", addedAt: "2026-01-02" }],
    badges: ["streak7"],
    hskQuizBest: { "1": 60, "2": 40 },
  };
  const m = mergeSyncPayload(server, client);
  assert.equal(m.savedWords.length, 2);
  assert.deepEqual(m.hskQuizBest, { "1": 90, "2": 40 });
  assert.deepEqual(m.badges, ["streak7"]);
  // merge lan 2 voi chinh no → khong doi (idempotent)
  const m2 = mergeSyncPayload(m, m);
  assert.deepEqual(m2, m);
});

test("mergeTestResults: union dedupe theo date|level, moi nhat truoc, cap 100", () => {
  const a = [
    { level: "hsk1", score: 7, total: 10, date: "2026-06-12T10:00:00.000Z" },
    { level: "hsk2", score: 5, total: 10, date: "2026-06-11T10:00:00.000Z" },
  ];
  const b = [
    { level: "hsk1", score: 7, total: 10, date: "2026-06-12T10:00:00.000Z" }, // trung → 1 ban
    { level: "hsk1", score: 9, total: 10, date: "2026-06-12T12:00:00.000Z" },
  ];
  const m = mergeTestResults(a, b);
  assert.equal(m.length, 3);
  assert.equal(m[0].date, "2026-06-12T12:00:00.000Z"); // moi nhat truoc
  // cap 100
  const many = Array.from({ length: 120 }, (_, i) => ({
    level: "hsk1", score: 5, total: 10,
    date: `2026-01-01T00:00:${String(i % 60).padStart(2, "0")}.${String(i).padStart(3, "0")}Z`,
  }));
  assert.equal(mergeTestResults(many, []).length, 100);
});

test("sanitizePayload: testResults loc ban ghi rac + payload cu khong co → []", () => {
  const p = sanitizePayload({
    testResults: [
      { level: "hsk1", score: 7, total: 10, date: "2026-06-12" },
      { level: 5, score: 7, total: 10, date: "x" },           // level sai kieu
      { level: "hsk1", score: 7, total: 0, date: "2026-06-12" }, // total=0
      null,
    ],
  });
  assert.equal(p.testResults.length, 1);
  const old = sanitizePayload({ savedWords: [] });
  assert.deepEqual(old.testResults, []);
});
