/**
 * ═══ Redis Client + Rate Limiter + Cache ═══
 * ใช้สำหรับ:
 * 1. Rate limiting (Redis sorted set sliding window + in-memory fallback)
 * 2. Caching (cacheGet/cacheSet/cacheInvalidate)
 *
 * Rate limit policy: FAIL-CLOSED with in-memory fallback
 * - ปกติ: ใช้ Redis sorted set (กระจายข้าม instance ได้)
 * - Redis ล่ม: fallback มาใช้ in-memory Map (per-process) — ปลอดภัยกว่า fail-open
 * - ถ้าจะ scale หลาย instance ต้องมี Redis ทำงาน (in-memory ไม่ sync)
 */
import Redis from 'ioredis'

let redis: Redis | null = null
let redisHealthy = true

export function getRedis(): Redis {
  if (redis) return redis

  const url = process.env.REDIS_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Redis] REDIS_URL is required in production')
    }
    console.warn('[Redis] REDIS_URL not set — using localhost (dev only)')
  }

  redis = new Redis(url || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 5) return null
      return Math.min(times * 200, 2000)
    },
  })

  redis.on('error', (err) => {
    redisHealthy = false
    console.error('[Redis] Connection error:', err.message)
  })

  redis.on('ready', () => {
    if (!redisHealthy) {
      console.info('[Redis] Reconnected — exiting fallback mode')
    }
    redisHealthy = true
  })

  return redis
}

// ═══════════ In-Memory Fallback Rate Limiter ═══════════
// ใช้เมื่อ Redis ล่ม — sliding window ใน Map (per-process)
// ไม่ sync ข้าม instance แต่ดีกว่า fail-open
const fallbackBuckets = new Map<string, number[]>()
const FALLBACK_GC_INTERVAL_MS = 60_000
let lastGc = Date.now()

function fallbackCheck(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now()

  if (now - lastGc > FALLBACK_GC_INTERVAL_MS) {
    for (const [k, timestamps] of fallbackBuckets) {
      const filtered = timestamps.filter((t) => now - t < windowMs)
      if (filtered.length === 0) fallbackBuckets.delete(k)
      else fallbackBuckets.set(k, filtered)
    }
    lastGc = now
  }

  const bucket = fallbackBuckets.get(key) ?? []
  const inWindow = bucket.filter((t) => now - t < windowMs)

  if (inWindow.length >= maxRequests) {
    fallbackBuckets.set(key, inWindow)
    return { allowed: false, remaining: 0 }
  }

  inWindow.push(now)
  fallbackBuckets.set(key, inWindow)
  return { allowed: true, remaining: maxRequests - inWindow.length }
}

/**
 * Rate limiter — Redis sorted set (sliding window) with in-memory fallback
 *
 * @param key  unique identifier (e.g. `login:${ip}`)
 * @param maxRequests  จำนวน request สูงสุดใน window
 * @param windowSeconds ขนาด window เป็นวินาที
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const windowMs = windowSeconds * 1000

  try {
    const r = getRedis()
    const now = Date.now()
    const redisKey = `rl:${key}`

    await r.zremrangebyscore(redisKey, 0, now - windowMs)
    const count = await r.zcard(redisKey)

    if (count >= maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    await r.zadd(redisKey, now, `${now}`)
    await r.expire(redisKey, windowSeconds)

    return { allowed: true, remaining: maxRequests - count - 1 }
  } catch (err) {
    redisHealthy = false
    console.warn(
      '[RateLimit] Redis unavailable — using in-memory fallback:',
      (err as Error).message,
    )
    return fallbackCheck(key, maxRequests, windowMs)
  }
}

// ═══════════ Cache Layer ═══════════
// ใช้สำหรับ public endpoints ที่อ่านบ่อย (news list, banners, site config)
// pattern: read-through cache + tag-based invalidation
//
// API: cacheGet(key), cacheSet(key, value, ttl), cacheInvalidate(pattern)

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis()
    const raw = await r.get(`cache:${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch (err) {
    console.warn('[Cache] Get failed:', (err as Error).message)
    return null
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = 60,
): Promise<void> {
  try {
    const r = getRedis()
    await r.set(`cache:${key}`, JSON.stringify(value), 'EX', ttlSeconds)
  } catch (err) {
    console.warn('[Cache] Set failed:', (err as Error).message)
  }
}

/**
 * Invalidate by pattern (uses SCAN to avoid KEYS * blocking)
 * @example cacheInvalidate('news:*') ลบทุก cache key ที่ขึ้นต้นด้วย news:
 */
export async function cacheInvalidate(pattern: string): Promise<number> {
  try {
    const r = getRedis()
    const fullPattern = `cache:${pattern}`
    let cursor = '0'
    let deleted = 0

    do {
      const [next, keys] = await r.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100)
      cursor = next
      if (keys.length > 0) {
        await r.del(...keys)
        deleted += keys.length
      }
    } while (cursor !== '0')

    return deleted
  } catch (err) {
    console.warn('[Cache] Invalidate failed:', (err as Error).message)
    return 0
  }
}

/**
 * Read-through cache helper — fetcher จะถูกเรียกเมื่อ cache miss
 * @example
 *   const news = await cacheRead('news:list:1', () => prisma.news.findMany(...), 60)
 */
export async function cacheRead<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60,
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached

  const fresh = await fetcher()
  await cacheSet(key, fresh, ttlSeconds)
  return fresh
}

export function isRedisHealthy(): boolean {
  return redisHealthy
}
