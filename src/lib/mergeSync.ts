/**
 * mergeSync — logic THUẦN hợp nhất dữ liệu học (local ↔ cloud), không phụ thuộc
 * mongoose/UI → unit test được. Dùng bởi /api/user/sync (server-side merge).
 *
 * Nguyên tắc: KHÔNG BAO GIỜ làm mất tiến độ — mọi nhánh đều union,
 * xung đột thì giữ bên có tiến độ xa hơn.
 */

export interface SyncSavedWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
  example?: string;
  addedAt: string;
}

export interface SyncCard {
  id: string;
  front: string;
  pinyin?: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  due: string;
}

export interface SyncDeck {
  id: string;
  name: string;
  emoji: string;
  cards: SyncCard[];
  createdAt: string;
}

export interface SyncStory {
  id: string;
  createdAt: string;
  [key: string]: unknown; // story/theme/level — giữ nguyên, không cần biết chi tiết
}

/**
 * Đoạn đọc tùy biến (thư viện /reading). id CÓ THỂ trùng khi lưu lại cùng một
 * truyện → cần savedAt để "lưu lại sau khi xóa → sống lại" (giống words/decks).
 * Bản cũ không có savedAt → coi như epoch 0 (tombstone thắng — an toàn).
 */
export interface SyncPassage {
  id: string;
  savedAt?: string;
  [key: string]: unknown; // title/words/translation… — giữ nguyên
}

/**
 * Tombstone — đánh dấu "đã xóa có chủ đích" để xóa lan qua thiết bị.
 * key → thời điểm xóa (ISO).
 * - words/decks: key tự nhiên (hanzi/id) có thể được THÊM LẠI → mục bị loại
 *   chỉ khi tombstone MỚI HƠN thời điểm tạo/lưu (thêm lại sau khi xóa → sống).
 * - cards/stories: id sinh ngẫu nhiên, thêm lại = id MỚI → chặn thẳng theo id
 *   (không cần so thời gian; tombstone không bao giờ giết nhầm bản mới).
 */
export interface SyncTombstones {
  words: Record<string, string>;    // hanzi → deletedAt
  decks: Record<string, string>;    // deckId → deletedAt
  cards: Record<string, string>;    // cardId → deletedAt (xóa 1 thẻ lẻ trong deck)
  stories: Record<string, string>;  // storyId → deletedAt (xóa lịch sử truyện)
  passages: Record<string, string>; // passageId → deletedAt (xóa đoạn đọc tùy biến)
}

/** Kết quả thi /test — không có thao tác xóa nên chỉ cần union, không cần tombstone. */
export interface SyncTestResult {
  level: string;
  score: number;
  total: number;
  date: string; // ISO — dùng làm khóa dedupe
}

export interface SyncPayload {
  savedWords: SyncSavedWord[];
  customDecks: SyncDeck[];
  storyHistory: SyncStory[];
  customPassages: SyncPassage[];
  hskQuizBest: Record<string, number>;
  badges: string[];
  testResults: SyncTestResult[];
  deleted: SyncTombstones;
}

export const EMPTY_SYNC: SyncPayload = {
  savedWords: [],
  customDecks: [],
  storyHistory: [],
  customPassages: [],
  hskQuizBest: {},
  badges: [],
  testResults: [],
  deleted: { words: {}, decks: {}, cards: {}, stories: {}, passages: {} },
};

const MAX_WORDS = 500;
const MAX_STORIES = 50;
const MAX_DECKS = 100;
const MAX_PASSAGES = 50;
const MAX_TOMBSTONES = 1000;
const MAX_TEST_RESULTS = 100;

/** Ép payload bất kỳ (client gửi lên) về dạng an toàn. */
export function sanitizePayload(raw: unknown): SyncPayload {
  const p = (raw ?? {}) as Partial<SyncPayload>;
  return {
    savedWords: Array.isArray(p.savedWords)
      ? p.savedWords.filter((w) => w && typeof w.hanzi === "string" && w.hanzi.length > 0).slice(0, MAX_WORDS)
      : [],
    customDecks: Array.isArray(p.customDecks)
      ? p.customDecks
          .filter((d) => d && typeof d.id === "string" && Array.isArray(d.cards))
          .slice(0, MAX_DECKS)
      : [],
    storyHistory: Array.isArray(p.storyHistory)
      ? p.storyHistory.filter((s) => s && typeof s.id === "string").slice(0, MAX_STORIES)
      : [],
    customPassages: Array.isArray(p.customPassages)
      ? p.customPassages.filter((x) => x && typeof x.id === "string").slice(0, MAX_PASSAGES)
      : [],
    hskQuizBest:
      p.hskQuizBest && typeof p.hskQuizBest === "object" && !Array.isArray(p.hskQuizBest)
        ? Object.fromEntries(
            Object.entries(p.hskQuizBest)
              .filter(([, v]) => typeof v === "number" && Number.isFinite(v))
              .map(([k, v]) => [k, Math.min(100, Math.max(0, Math.round(v as number)))])
          )
        : {},
    badges: Array.isArray(p.badges) ? p.badges.filter((b) => typeof b === "string").slice(0, 200) : [],
    testResults: Array.isArray(p.testResults)
      ? p.testResults
          .filter((r) => r && typeof r.level === "string" && typeof r.date === "string"
            && typeof r.score === "number" && typeof r.total === "number" && r.total > 0)
          .slice(0, MAX_TEST_RESULTS)
      : [],
    deleted: sanitizeTombstones(p.deleted),
  };
}

function sanitizeTombstoneMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([k, v]) => k.length > 0 && typeof v === "string" && !isNaN(new Date(v as string).getTime()))
    // tombstone mới nhất trước, cap số lượng (prune cũ nhất)
    .sort((a, b) => new Date(b[1] as string).getTime() - new Date(a[1] as string).getTime())
    .slice(0, MAX_TOMBSTONES);
  return Object.fromEntries(entries) as Record<string, string>;
}

function sanitizeTombstones(raw: unknown): SyncTombstones {
  const t = (raw ?? {}) as Partial<SyncTombstones>;
  return {
    words: sanitizeTombstoneMap(t.words),
    decks: sanitizeTombstoneMap(t.decks),
    cards: sanitizeTombstoneMap(t.cards),
    stories: sanitizeTombstoneMap(t.stories),
    passages: sanitizeTombstoneMap(t.passages),
  };
}

/** Union tombstone — mỗi key giữ thời điểm xóa MUỘN nhất. */
export function mergeTombstoneMap(a: Record<string, string>, b: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (!out[k] || new Date(v).getTime() > new Date(out[k]).getTime()) out[k] = v;
  }
  return sanitizeTombstoneMap(out);
}

/** Mục "sống" nếu không có tombstone, hoặc được tạo/lưu SAU thời điểm xóa. */
function survives(itemTime: string, deletedAt: string | undefined): boolean {
  if (!deletedAt) return true;
  return new Date(itemTime).getTime() > new Date(deletedAt).getTime();
}

/**
 * Union theo hanzi — giữ addedAt MUỘN nhất.
 * (Quan trọng cho tombstone: lưu lại từ SAU khi xóa = "thêm lại" → addedAt mới
 * phải thắng để từ sống lại; nếu giữ addedAt cũ thì tombstone sẽ giết nhầm.)
 */
export function mergeSavedWords(a: SyncSavedWord[], b: SyncSavedWord[]): SyncSavedWord[] {
  const map = new Map<string, SyncSavedWord>();
  for (const w of [...a, ...b]) {
    const cur = map.get(w.hanzi);
    if (!cur || new Date(w.addedAt).getTime() > new Date(cur.addedAt).getTime()) {
      map.set(w.hanzi, w);
    }
  }
  return [...map.values()]
    .sort((x, y) => new Date(y.addedAt).getTime() - new Date(x.addedAt).getTime())
    .slice(0, MAX_WORDS);
}

/** Xung đột thẻ: giữ thẻ có tiến độ SRS xa hơn (repetitions cao hơn; hòa → due muộn hơn). */
function pickCard(a: SyncCard, b: SyncCard): SyncCard {
  if (a.repetitions !== b.repetitions) return a.repetitions > b.repetitions ? a : b;
  return new Date(a.due).getTime() >= new Date(b.due).getTime() ? a : b;
}

/** Union deck theo id; trong deck union card theo id. Deck trùng id lấy name/emoji của bản có nhiều thẻ hơn. */
export function mergeDecks(a: SyncDeck[], b: SyncDeck[]): SyncDeck[] {
  const map = new Map<string, SyncDeck>();
  for (const d of [...a, ...b]) {
    const cur = map.get(d.id);
    if (!cur) {
      map.set(d.id, { ...d, cards: [...d.cards] });
      continue;
    }
    const cardMap = new Map<string, SyncCard>();
    for (const c of [...cur.cards, ...d.cards]) {
      const exist = cardMap.get(c.id);
      cardMap.set(c.id, exist ? pickCard(exist, c) : c);
    }
    const meta = d.cards.length > cur.cards.length ? d : cur;
    map.set(d.id, { ...meta, cards: [...cardMap.values()] });
  }
  return [...map.values()].slice(0, MAX_DECKS);
}

/** Union truyện theo id, mới nhất trước, cap 50 (khớp MAX_HISTORY của /generate). */
export function mergeStories(a: SyncStory[], b: SyncStory[]): SyncStory[] {
  const map = new Map<string, SyncStory>();
  for (const s of [...a, ...b]) if (!map.has(s.id)) map.set(s.id, s);
  return [...map.values()]
    .sort((x, y) => new Date(y.createdAt as string).getTime() - new Date(x.createdAt as string).getTime())
    .slice(0, MAX_STORIES);
}

/** Union đoạn đọc theo id — giữ bản có savedAt MUỘN nhất (lưu lại = làm mới). */
export function mergePassages(a: SyncPassage[], b: SyncPassage[]): SyncPassage[] {
  const at = (p: SyncPassage) => new Date(p.savedAt ?? 0).getTime() || 0;
  const map = new Map<string, SyncPassage>();
  for (const p of [...a, ...b]) {
    const cur = map.get(p.id);
    if (!cur || at(p) > at(cur)) map.set(p.id, p);
  }
  return [...map.values()].sort((x, y) => at(y) - at(x)).slice(0, MAX_PASSAGES);
}

/** Điểm quiz: lấy MAX từng level. */
export function mergeQuizBest(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}

/** Huy hiệu: union. */
export function mergeBadges(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
}

/**
 * Kết quả thi: union dedupe theo (date|level) — date có mili-giây nên va chạm
 * thực tế chỉ xảy ra khi đúng là cùng một bản ghi; sắp xếp MỚI NHẤT trước, cap 100.
 */
export function mergeTestResults(a: SyncTestResult[], b: SyncTestResult[]): SyncTestResult[] {
  const map = new Map<string, SyncTestResult>();
  for (const r of [...a, ...b]) map.set(`${r.date}|${r.level}`, r);
  return [...map.values()]
    .sort((x, y) => y.date.localeCompare(x.date))
    .slice(0, MAX_TEST_RESULTS);
}

/**
 * Merge tổng — union mọi nhánh, sau đó áp tombstone:
 * mục bị xóa có chủ đích (ở bất kỳ thiết bị nào) sẽ bị loại,
 * TRỪ KHI nó được thêm lại sau thời điểm xóa.
 */
export function mergeSyncPayload(server: SyncPayload, client: SyncPayload): SyncPayload {
  const deleted: SyncTombstones = {
    words: mergeTombstoneMap(server.deleted.words, client.deleted.words),
    decks: mergeTombstoneMap(server.deleted.decks, client.deleted.decks),
    cards: mergeTombstoneMap(server.deleted.cards, client.deleted.cards),
    stories: mergeTombstoneMap(server.deleted.stories, client.deleted.stories),
    passages: mergeTombstoneMap(server.deleted.passages, client.deleted.passages),
  };
  return {
    savedWords: mergeSavedWords(server.savedWords, client.savedWords).filter((w) =>
      survives(w.addedAt, deleted.words[w.hanzi])
    ),
    customDecks: mergeDecks(server.customDecks, client.customDecks)
      .filter((d) => survives(d.createdAt, deleted.decks[d.id]))
      // thẻ lẻ đã xóa: chặn theo id (id mới sinh ngẫu nhiên nên không giết nhầm thẻ thêm lại)
      .map((d) => ({ ...d, cards: d.cards.filter((c) => !deleted.cards[c.id]) })),
    storyHistory: mergeStories(server.storyHistory, client.storyHistory).filter(
      (s) => !deleted.stories[s.id]
    ),
    customPassages: mergePassages(server.customPassages, client.customPassages).filter((p) =>
      survives(p.savedAt ?? new Date(0).toISOString(), deleted.passages[p.id])
    ),
    hskQuizBest: mergeQuizBest(server.hskQuizBest, client.hskQuizBest),
    badges: mergeBadges(server.badges, client.badges),
    testResults: mergeTestResults(server.testResults, client.testResults),
    deleted,
  };
}

/**
 * Co payload về dưới maxBytes (mặc định 200KB — dưới giới hạn 256KB của API):
 * bỏ dần TRUYỆN cũ nhất, rồi ĐOẠN ĐỌC cũ nhất (2 nhánh nặng nhất — chứa cả
 * văn bản truyện). Các nhánh tiến độ học (từ/deck/điểm/tombstone) giữ nguyên.
 */
export function fitPayload(payload: SyncPayload, maxBytes = 200 * 1024): SyncPayload {
  let p = payload;
  const size = (x: SyncPayload) => JSON.stringify(x).length;
  if (size(p) <= maxBytes) return p;

  const byOldest = <T extends { createdAt?: unknown; savedAt?: unknown }>(arr: T[], key: "createdAt" | "savedAt") =>
    [...arr].sort(
      (a, b) => new Date((b[key] as string) ?? 0).getTime() - new Date((a[key] as string) ?? 0).getTime()
    );

  // 1) bỏ dần truyện cũ nhất
  let stories = byOldest(p.storyHistory, "createdAt");
  while (stories.length > 0 && size({ ...p, storyHistory: stories }) > maxBytes) {
    stories = stories.slice(0, -1);
  }
  p = { ...p, storyHistory: stories };
  if (size(p) <= maxBytes) return p;

  // 2) bỏ dần đoạn đọc cũ nhất
  let passages = byOldest(p.customPassages, "savedAt");
  while (passages.length > 0 && size({ ...p, customPassages: passages }) > maxBytes) {
    passages = passages.slice(0, -1);
  }
  return { ...p, customPassages: passages };
}

/**
 * Hash ổn định (djb2) của payload — client dùng để biết local có thay đổi
 * chưa sync hay không (so với hash lưu lúc sync gần nhất). Thuần → test được.
 */
export function stableHash(payload: SyncPayload): string {
  const s = JSON.stringify(payload);
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36) + ":" + s.length.toString(36);
}
