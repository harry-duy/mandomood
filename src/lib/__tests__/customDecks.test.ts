import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

/** Mock localStorage toi gian cho moi truong test (node). */
const map = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
  },
};

import {
  getDecks, createDeck, deleteDeck, addCard, removeCard, getDueCards, gradeCard,
} from "../customDecks";

beforeEach(() => map.clear());

test("createDeck + getDecks: tao va doc lai", () => {
  const d = createDeck("Test deck", "🔥");
  const all = getDecks();
  assert.equal(all.length, 1);
  assert.equal(all[0].id, d.id);
  assert.equal(all[0].name, "Test deck");
  assert.equal(all[0].cards.length, 0);
});

test("addCard: the moi den han ngay lap tuc", () => {
  const d = createDeck("A");
  addCard(d.id, { front: "加油", back: "Co len", pinyin: "jiā yóu" });
  const deck = getDecks()[0];
  assert.equal(deck.cards.length, 1);
  assert.equal(getDueCards(deck).length, 1);
});

test("gradeCard: tra loi dung (q=5) -> gian lich, het han hom nay", () => {
  const d = createDeck("A");
  addCard(d.id, { front: "你好", back: "Xin chao" });
  const card = getDecks()[0].cards[0];
  gradeCard(d.id, card.id, 5);
  const after = getDecks()[0].cards[0];
  assert.equal(after.repetitions, 1);
  assert.equal(after.interval, 1);
  assert.equal(getDueCards(getDecks()[0]).length, 0); // mai moi den han
});

test("gradeCard: quen (q=0) -> reset, van den han ngay mai", () => {
  const d = createDeck("A");
  addCard(d.id, { front: "爱", back: "Yeu" });
  const card = getDecks()[0].cards[0];
  gradeCard(d.id, card.id, 5);
  gradeCard(d.id, card.id, 0);
  const after = getDecks()[0].cards[0];
  assert.equal(after.repetitions, 0);
  assert.equal(after.interval, 1);
});

test("removeCard + deleteDeck", () => {
  const d = createDeck("A");
  addCard(d.id, { front: "水", back: "Nuoc" });
  removeCard(d.id, getDecks()[0].cards[0].id);
  assert.equal(getDecks()[0].cards.length, 0);
  deleteDeck(d.id);
  assert.equal(getDecks().length, 0);
});

test("getDueCards: sắp thẻ quá hạn lâu nhất trước (Sprint 109)", () => {
  const deck = createDeck("SRS order");
  addCard(deck.id, { front: "A", back: "a" });
  addCard(deck.id, { front: "B", back: "b" });
  addCard(deck.id, { front: "C", back: "c" });
  const decks = getDecks();
  const d = decks.find((x) => x.id === deck.id)!;
  const now = Date.now();
  const byFront = (f: string) => d.cards.find((c) => c.front === f)!;
  byFront("A").due = new Date(now - 1 * 86400000).toISOString();   // -1 ngày
  byFront("B").due = new Date(now - 5 * 86400000).toISOString();   // -5 ngày (lâu nhất)
  byFront("C").due = new Date(now - 0.1 * 86400000).toISOString(); // gần nhất
  // Ghi thẳng vào mock localStorage (key nội bộ của customDecks).
  (globalThis as unknown as { window: { localStorage: { setItem(k: string, v: string): void } } })
    .window.localStorage.setItem("mm_custom_decks", JSON.stringify(decks));
  const due = getDueCards(getDecks().find((x) => x.id === deck.id)!);
  assert.deepEqual(due.map((c) => c.front), ["B", "A", "C"], "quá-hạn-lâu-nhất phải đứng trước");
});
