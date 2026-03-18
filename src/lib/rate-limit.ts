/**
 * Basic in-memory rate limiter for public API endpoints.
 * Note: Reset on server restart. In a distributed environment or edge, 
 * use Redis or Vercel KV for a persistent distributed rate limiter.
 */

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const tracker = rateLimitMap.get(ip);

  // If new IP or reset time has passed
  if (!tracker || tracker.resetTime < now) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true; // Allowed
  }

  // If within window, increment count
  tracker.count++;
  if (tracker.count > limit) {
    return false; // Rate limited
  }

  return true; // Allowed
}
