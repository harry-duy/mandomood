/**
 * Simple in-memory rate limiter cho AI routes
 * Max 10 requests/minute per IP
 * Reset sau mỗi phút
 */

const store = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + windowMs });
    // Cleanup old entries (max 1000 IPs)
    if (store.size > 1000) {
      const firstKey = store.keys().next().value;
      if (firstKey) store.delete(firstKey);
    }
    return true; // allowed
  }

  if (entry.count >= limit) return false; // blocked

  entry.count++;
  return true; // allowed
}

export function getRateLimitHeaders(ip: string, limit = 10) {
  const entry = store.get(ip);
  const remaining = entry ? Math.max(0, limit - entry.count) : limit;
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
}
