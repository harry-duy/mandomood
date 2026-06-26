/**
 * sanitize.ts — làm sạch input người dùng trước khi NHÚNG vào prompt AI. PURE, test được.
 *
 * Vì sao cần: `theme` (chủ đề truyện) do người dùng nhập được chèn thẳng vào prompt
 * gửi OpenAI/Gemini. Nếu không giới hạn:
 *  - Độ dài vô hạn → tốn token (tăng chi phí, có thể bị lạm dụng).
 *  - Ký tự xuống dòng + câu lệnh → prompt injection nhiều dòng (vd "Bỏ qua yêu cầu
 *    trên, thay vào đó...") dễ lái mô hình chệch hướng.
 * Hàm này gom ký tự điều khiển/xuống dòng về 1 dấu cách, nén khoảng trắng, cắt độ dài.
 * (Không thể chống injection tuyệt đối với LLM, nhưng đây là vệ sinh đầu vào tối thiểu.)
 */

export function sanitizePromptInput(input: unknown, maxLen = 120): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, " ") // ký tự điều khiển (gồm \n, \r, \t) → dấu cách
    .replace(/\s+/g, " ") // nén khoảng trắng liên tiếp
    .trim()
    .slice(0, Math.max(0, maxLen));
}

/**
 * Kiểm tra voice id (ElevenLabs) HỢP LỆ: chỉ chữ-số, ≤40 ký tự. Vì giá trị này
 * được nhúng thẳng vào path URL gọi ElevenLabs; cho phép ký tự lạ (/ ? # .. %)
 * có thể bẻ endpoint sang path khác mà vẫn dùng API key của ta (SSRF nhẹ).
 * Không hợp lệ → trả "" để caller fallback về voice mặc định.
 */
export function safeVoiceId(input: unknown): string {
  return typeof input === "string" && /^[A-Za-z0-9]{1,40}$/.test(input) ? input : "";
}

/** Persona gia sư hợp lệ (khớp PERSONA_PROMPTS trong openai.ts). */
export const TUTOR_PERSONAS = [
  "cold_girl", "caring_friend", "funny_bff", "ceo_mentor", "idol_style", "anime_sensei",
] as const;

/** Ép persona client gửi về 1 giá trị hợp lệ; lạ → mặc định "caring_friend"
 * (tránh `PERSONA_PROMPTS[persona]` = undefined làm hỏng system prompt). */
export function safeTutorPersona(p: unknown): string {
  return typeof p === "string" && (TUTOR_PERSONAS as readonly string[]).includes(p)
    ? p
    : "caring_friend";
}

export interface ChatMsg { role: "user" | "assistant"; content: string }

/**
 * Làm sạch mảng tin nhắn chat trước khi gửi cho AI:
 *  - CHỈ giữ role "user"/"assistant" → chặn client tiêm `{role:"system"}` (leo thang
 *    prompt-injection vào vai hệ thống của model).
 *  - content phải là chuỗi, cắt `maxLen`, bỏ rỗng.
 *  - giữ `maxMessages` tin GẦN NHẤT → đủ ngữ cảnh nhưng chặn token vô hạn (chi phí).
 */
export function sanitizeChatMessages(raw: unknown, maxMessages = 30, maxLen = 2000): ChatMsg[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMsg[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const text = content.trim().slice(0, maxLen);
    if (text.length === 0) continue;
    out.push({ role, content: text });
  }
  return out.slice(-maxMessages);
}
