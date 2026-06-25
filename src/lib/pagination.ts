/**
 * pagination.ts — chuẩn hoá tham số phân trang từ query string. PURE, test được.
 *
 * Vì sao cần: nếu lấy `limit`/`page` thô từ query rồi đưa thẳng vào Mongo:
 *  - `limit=0` → Mongo `.limit(0)` = KHÔNG giới hạn → trả VỀ TẤT CẢ (DoS/chi phí).
 *  - `limit=999999` → payload khổng lồ.
 *  - `page=0`/âm → `skip` âm → lỗi/hành vi lạ.
 *  - `limit=abc` → NaN → `.limit(NaN)` khó lường.
 * Hàm này kẹp `page ≥ 1`, `limit ∈ [1, maxLimit]`, và tính sẵn `skip`.
 */

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

function toInt(v: unknown, fallback: number): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parsePagination(
  pageRaw: unknown,
  limitRaw: unknown,
  opts: { defaultLimit?: number; maxLimit?: number } = {}
): Pagination {
  const defaultLimit = opts.defaultLimit ?? 10;
  const maxLimit = opts.maxLimit ?? 50;

  const page = Math.max(1, toInt(pageRaw, 1));
  const limit = Math.min(maxLimit, Math.max(1, toInt(limitRaw, defaultLimit)));
  return { page, limit, skip: (page - 1) * limit };
}
