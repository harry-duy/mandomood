/**
 * adminUserFilter.ts — Dựng Mongo query lọc user cho trang admin.
 * PURE (không I/O) để unit-test. Dùng bởi /api/admin/users.
 *
 * tier:
 *   - premium: có cờ premium=true HOẶC premium_until còn hạn
 *   - trial:   trial_until còn hạn VÀ không phải premium
 *   - free:    không premium, không trial còn hạn
 */
export type Tier = "premium" | "trial" | "free";
const VALID_LEVELS = ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"];

/** Escape regex an toàn (chặn ReDoS / ký tự đặc biệt). */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isValidTier(t: unknown): t is Tier {
  return t === "premium" || t === "trial" || t === "free";
}

export function isValidLevel(l: unknown): boolean {
  return typeof l === "string" && VALID_LEVELS.includes(l);
}

export interface FilterInput {
  q?: string;
  tier?: string;
  level?: string;
}

/**
 * Trả về { query, active }:
 *  - query: điều kiện Mongo (rỗng {} nếu không lọc gì)
 *  - active: true nếu có ít nhất 1 tiêu chí hợp lệ (q>=2 ký tự, tier, hoặc level)
 */
export function buildUserFilter(
  input: FilterInput,
  now: Date = new Date()
): { query: Record<string, unknown>; active: boolean } {
  const and: Record<string, unknown>[] = [];
  const q = (input.q ?? "").trim();
  let active = false;

  if (q.length >= 2) {
    const rx = new RegExp(escapeRegex(q), "i");
    and.push({ $or: [{ name: rx }, { email: rx }] });
    active = true;
  }

  if (isValidTier(input.tier)) {
    active = true;
    if (input.tier === "premium") {
      and.push({ $or: [{ premium: true }, { premium_until: { $gt: now } }] });
    } else if (input.tier === "trial") {
      and.push({ trial_until: { $gt: now } });
      and.push({ $nor: [{ premium: true }, { premium_until: { $gt: now } }] });
    } else {
      // free: không dính premium lẫn trial còn hạn
      and.push({ $nor: [{ premium: true }, { premium_until: { $gt: now } }, { trial_until: { $gt: now } }] });
    }
  }

  if (isValidLevel(input.level)) {
    and.push({ level: input.level });
    active = true;
  }

  const query = and.length === 0 ? {} : and.length === 1 ? and[0] : { $and: and };
  return { query, active };
}
