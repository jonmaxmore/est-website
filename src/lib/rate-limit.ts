// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  register: { windowMs: 60 * 1000, maxRequests: 10 },
  read: { windowMs: 60 * 1000, maxRequests: 60 },
  referral: { windowMs: 60 * 1000, maxRequests: 30 },
};

export function checkRateLimit(
  key: string,
  endpoint: string = 'read'
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.read;
  const now = Date.now();
  const identifier = `${key}:${endpoint}`;

  const existing = rateLimitMap.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: existing.resetTime - now,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetIn: existing.resetTime - now,
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);
