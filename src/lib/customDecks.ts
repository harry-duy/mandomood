/**
 * customDecks — bộ flashcard tự tạo (kiểu Quizlet/OpenQuiz).
 * Lưu localStorage (offline-first, không cần đăng nhập). Học bằng SM-2 (lib/srs).
 */

import { readJSON, writeJSON } from "@/lib/utils";
import { sm2, nextReviewDate } from "@/lib/srs";
import { recordDeckDeleted, recordCardDeleted } from "@/lib/syncDeleted";

const STORAGE_KEY = "mm_custom_decks";

export interface CustomCard {
  id: string;
  front: string;        // chữ Hán / thuật ngữ
  pinyin?: string;
  back: string;         // nghĩa
  easeFactor: number;
  interval: number;
  repetitions: number;
  due: string;          // ISO date — đến hạn ôn
}

export interface CustomDeck {
  id: string;
  name: string;
  emoji: string;
  cards: CustomCard[];
  createdAt: string;
}

function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function getDecks(): CustomDeck[] {
  return readJSON<CustomDeck[]>(STORAGE_KEY, []);
}

function saveDecks(decks: CustomDeck[]): void {
  writeJSON(STORAGE_KEY, decks);
}

export function createDeck(name: string, emoji = "📚"): CustomDeck {
  const deck: CustomDeck = {
    id: uid(),
    name: name.trim(),
    emoji,
    cards: [],
    createdAt: new Date().toISOString(),
  };
  saveDecks([deck, ...getDecks()]);
  return deck;
}

export function deleteDeck(deckId: string): void {
  saveDecks(getDecks().filter((d) => d.id !== deckId));
  // Tombstone để lần sync sau deck không "sống lại" từ cloud / thiết bị khác
  recordDeckDeleted(deckId);
}

export function renameDeck(deckId: string, name: string): void {
  saveDecks(getDecks().map((d) => (d.id === deckId ? { ...d, name: name.trim() } : d)));
}

export function addCard(
  deckId: string,
  card: { front: string; back: string; pinyin?: string }
): void {
  const newCard: CustomCard = {
    id: uid(),
    front: card.front.trim(),
    back: card.back.trim(),
    pinyin: card.pinyin?.trim() || undefined,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    due: new Date().toISOString(),
  };
  saveDecks(
    getDecks().map((d) =>
      d.id === deckId ? { ...d, cards: [...d.cards, newCard] } : d
    )
  );
}

export function removeCard(deckId: string, cardId: string): void {
  saveDecks(
    getDecks().map((d) =>
      d.id === deckId ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d
    )
  );
  // Tombstone để thẻ không "sống lại" từ cloud sau khi sync
  recordCardDeleted(cardId);
}

/** Thẻ đến hạn ôn của 1 deck (due <= now). */
export function getDueCards(deck: CustomDeck): CustomCard[] {
  const now = Date.now();
  return deck.cards.filter((c) => new Date(c.due).getTime() <= now);
}

/** Chấm 1 thẻ theo SM-2 và lưu lại. quality 0–5. */
export function gradeCard(deckId: string, cardId: string, quality: number): void {
  saveDecks(
    getDecks().map((d) => {
      if (d.id !== deckId) return d;
      return {
        ...d,
        cards: d.cards.map((c) => {
          if (c.id !== cardId) return c;
          const next = sm2(c.easeFactor, c.interval, c.repetitions, quality);
          return {
            ...c,
            ...next,
            due: nextReviewDate(next.interval).toISOString(),
          };
        }),
      };
    })
  );
}
