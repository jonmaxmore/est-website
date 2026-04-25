/**
 * ═══ Redis Client + Rate Limiter ═══
 * ใช้สำหรับ:
 * 1. Rate limiting (จำกัดจำนวน request ต่อ IP)
 * 2. Caching (เช่น sitemap)
 *
 * สำคัญ: ถ้า Redis ล่ม ระบบยังทำงานได้ (graceful degradation)
 * — rate limit จะ allow ทุก request แทน
 */
import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (redis) return redis

  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // ลอง reconnect สูงสุด 5 ครั้ง ระยะห่างเพิ่มขึ้นเรื่อยๆ
    retryStrategy(times) {
      if (times > 5) return null
      return Math.min(times * 200, 2000)
    },
  })

  redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message)
  })

  return redis
}

/**
 * Rate limiter ใช้ Redis sorted set (sliding window)
 *
 * วิธีทำงาน:
 * 1. ลบ request เก่าที่เกิน window ออก
 * 2. นับ request ปัจจุบัน
 * 3. ถ้าเกิน limit → ปฏิเสธ
 * 4. ถ้ายังไม่เกิน → เพิ่ม request ใหม่เข้าไป
 *
 * ⚠️ ถ้า Redis ใช้ไม่ได้ → อนุญาตทุก request (fail-open)
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const r = getRedis()
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const redisKey = `rl:${key}`

    // ลบ request เก่าที่อยู่นอก window
    await r.zremrangebyscore(redisKey, 0, now - windowMs)

    // นับจำนวน request ใน window ปัจจุบัน
    const count = await r.zcard(redisKey)

    if (count >= maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    // เพิ่ม request ปัจจุบันเข้า sorted set
    await r.zadd(redisKey, now, `${now}`)
    await r.expire(redisKey, windowSeconds)

    return { allowed: true, remaining: maxRequests - count - 1 }
  } catch (err) {
    // Graceful degradation: Redis ล่ม → อนุญาตทุก request
    console.warn('[RateLimit] Redis unavailable, allowing request:', (err as Error).message)
    return { allowed: true, remaining: maxRequests }
  }
}
