/**
 * Trích YouTube video id từ link bất kỳ (watch?v=, youtu.be/, /embed/, /shorts/)
 * hoặc id 11 ký tự dán thẳng. Trả null nếu không hợp lệ. PURE — test được.
 */

const ID_RE = /^[\w-]{11}$/;

export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (ID_RE.test(s)) return s;
  try {
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1).split("/")[0];
      return ID_RE.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && ID_RE.test(last)) return last;
    }
  } catch {
    return null;
  }
  return null;
}
