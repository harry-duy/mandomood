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
