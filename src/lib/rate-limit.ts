/**
 * In-memory rate limiter with automatic cleanup.
 * Note: Resets on server restart. For distributed environments,
 * use Redis or Upstash for persistent rate limiting.
 */

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

// Cleanup expired entries every 60 seconds to prevent memory leak
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, tracker] of rateLimitMap) {
      if (tracker.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
    // Stop cleanup if map is empty to avoid unnecessary work
    if (rateLimitMap.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);
  // Allow process to exit even if timer is active
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const tracker = rateLimitMap.get(ip);

  // If new IP or reset time has passed
  if (!tracker || tracker.resetTime < now) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    startCleanup();
    return true;
  }

  // If within window, increment count
  tracker.count++;
  if (tracker.count > limit) {
    return false;
  }

  return true;
}
