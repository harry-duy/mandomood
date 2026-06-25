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
