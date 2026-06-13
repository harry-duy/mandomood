/**
 * Tach van ban tieng Trung thanh cac CAU theo dau ket cau va xuong dong.
 * Dung cho karaoke doc truyen (StoryKaraoke). PURE - test duoc.
 */

const ENDERS = /(?<=[\u3002\uFF01\uFF1F!?\uFF1B;\u2026\n])/;

export function splitSentences(text: string): string[] {
  return text
    .split(ENDERS)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Chuan hoa pinyin de so sanh de dai (dung cho /dictation):
 * - bo dau thanh (ni3 -> ni)
 * - u-umlaut -> v (kieu go ban phim chuan: nu: ~ nv)
 * - bo khoang trang, ky tu la, viet thuong
 * PURE - test duoc.
 */
export function normalizePinyin(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    // Sau NFD, u-umlaut = "u" + U+0308 (combining diaeresis) -> doi thanh "v"
    // TRUOC khi xoa cac dau ket hop con lai (dau thanh U+0300-U+036F).
    .replace(/u\u0308/g, "v")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Chuan hoa chu Han: chi bo khoang trang. */
export function normalizeHanzi(s: string): string {
  return s.replace(/\s/g, "");
}

/**
 * Chuan hoa CAU chu Han de cham chinh ta: chi giu ky tu Han
 * (bo dau cau, khoang trang, so, chu latin). PURE - test duoc.
 */
export function normalizeSentenceHanzi(s: string): string {
  return Array.from(s.normalize("NFC"))
    .filter((ch) => /\p{Script=Han}/u.test(ch))
    .join("");
}
