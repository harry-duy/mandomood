/**
 * fetchJSON — gọi API có timeout + tự retry (exponential backoff).
 *
 * Dùng cho các lời gọi AI (story, chat, grade…) hay bị chập chờn mạng hoặc
 * model thỉnh thoảng trả lỗi 5xx/timeout. Tránh "trắng màn hình" khi 1 lần
 * gọi thất bại tạm thời.
 *
 * - Retry với lỗi mạng, timeout, và HTTP 429/5xx.
 * - KHÔNG retry với 4xx khác (400/401/403/404) vì retry vô nghĩa.
 * - Ném Error có message thân thiện để UI hiển thị.
 */

export interface FetchJSONOptions extends RequestInit {
  /** Số lần thử lại (không tính lần đầu). Mặc định 2. */
  retries?: number;
  /** Timeout mỗi lần thử (ms). Mặc định 30s — đủ cho AI. */
  timeoutMs?: number;
  /** Delay khởi điểm giữa các lần retry (ms). Mặc định 600. */
  backoffMs?: number;
  /** Callback báo đang retry (để UI hiện "đang thử lại..."). */
  onRetry?: (attempt: number, error: unknown) => void;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchJSON<T = unknown>(
  url: string,
  options: FetchJSONOptions = {}
): Promise<T> {
  const {
    retries = 2,
    timeoutMs = 30_000,
    backoffMs = 600,
    onRetry,
    ...init
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        return (await res.json()) as T;
      }

      // Lỗi HTTP — đọc message nếu có
      let message = `Lỗi ${res.status}`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        /* body không phải JSON */
      }

      if (RETRYABLE_STATUS.has(res.status) && attempt < retries) {
        lastError = new Error(message);
        onRetry?.(attempt + 1, lastError);
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
      const httpErr = new Error(message) as Error & { status?: number };
      httpErr.status = res.status;
      throw httpErr;
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const friendly = isAbort
        ? new Error("Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.")
        : err instanceof Error
          ? err
          : new Error("Lỗi kết nối");

      // Lỗi 4xx đã ném ở trên (không retryable) → ra ngoài luôn.
      // Ưu tiên check status thật (kể cả message tùy biến từ server như 402 hết lượt).
      const errStatus = (err as { status?: number })?.status;
      const isHttpClientError =
        (typeof errStatus === "number" && errStatus >= 400 && errStatus < 500 && errStatus !== 429) ||
        (err instanceof Error && /^Lỗi 4\d\d/.test(err.message));

      if (isHttpClientError || attempt >= retries) {
        throw friendly;
      }
      lastError = friendly;
      onRetry?.(attempt + 1, friendly);
      await sleep(backoffMs * Math.pow(2, attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Lỗi không xác định");
}

/** Tiện ích POST JSON có retry. */
export function postJSON<T = unknown>(
  url: string,
  body: unknown,
  options: FetchJSONOptions = {}
): Promise<T> {
  // Spread options TRƯỚC rồi đặt method/headers/body sau → options không thể
  // vô tình ghi đè (đặc biệt làm MẤT Content-Type khi caller truyền headers riêng).
  return fetchJSON<T>(url, {
    ...options,
    method: options.method ?? "POST",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    body: JSON.stringify(body),
  });
}
