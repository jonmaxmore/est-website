/**
 * In-memory rate limiter with automatic cleanup.
 *
 * PRODUCTION NOTE: This resets on server restart and does not work
 * across multiple instances. For production at scale, replace with:
 *   - Upstash Redis (@upstash/ratelimit) for serverless
 *   - ioredis sliding-window for traditional deployments
 *   - Nginx/Cloudflare rate limiting at the infrastructure level
 *
 * CSRF NOTE: Next.js Server Actions include built-in CSRF protection
 * via origin checking. API routes using POST with JSON bodies are
 * inherently CSRF-resistant (browsers won't send JSON cross-origin
 * without CORS preflight). Additional CSRF tokens are not required
 * for this architecture.
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
