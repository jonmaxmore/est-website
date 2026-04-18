import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (redis) return redis

  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
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
 * Simple rate limiter using Redis sliding window
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const r = getRedis()
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const redisKey = `rl:${key}`

  // Remove old entries outside window
  await r.zremrangebyscore(redisKey, 0, now - windowMs)

  // Count current entries
  const count = await r.zcard(redisKey)

  if (count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  // Add current request
  await r.zadd(redisKey, now, `${now}`)
  await r.expire(redisKey, windowSeconds)

  return { allowed: true, remaining: maxRequests - count - 1 }
}
