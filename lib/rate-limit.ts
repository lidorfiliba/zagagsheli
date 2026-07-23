/**
 * Tiny in-memory rate limiter — good enough for a single-instance VPS deploy.
 * When the site is ready to horizontally scale, swap this for @upstash/ratelimit
 * (Redis) or a middleware-level rule.
 *
 * Keys are opaque strings (usually `"<purpose>:<ip>"`). The bucket is reset
 * on first hit after expiry — a rolling window would be more accurate but this
 * is simpler and adequate for form-spam prevention.
 */
const buckets = new Map<string, { count: number; expires: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.expires < now) {
    buckets.set(key, { count: 1, expires: now + windowMs });
    return true;
  }
  bucket.count++;
  return bucket.count <= limit;
}

// Occasional GC — expired keys accumulate if never re-hit. Runs on every 1000th
// call, which is cheap enough.
let _ops = 0;
export function _maybeGc() {
  if (++_ops < 1000) return;
  _ops = 0;
  const now = Date.now();
  for (const [k, b] of buckets) if (b.expires < now) buckets.delete(k);
}
