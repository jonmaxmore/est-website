/**
 * GET /api/health — liveness/readiness probe
 *
 * Modes:
 *  - shallow (default): just confirms the Node process is up. Very cheap; safe
 *    to poll every few seconds from a load balancer or container orchestrator.
 *  - deep (?deep=1): also pings Postgres (SELECT 1) and Redis. Use this for
 *    readiness checks that should fail when downstream dependencies are sick.
 *
 * Always returns JSON. HTTP status:
 *  - 200 when all probes pass
 *  - 503 when any deep probe fails
 *
 * Cache-Control: no-store — health responses must always reflect current state.
 */
import { isRedisHealthy } from '../utils/redis'
import { logger } from '../utils/logger'

const log = logger.child({ scope: 'health' })

type ProbeResult = { status: 'ok' | 'fail' | 'skipped'; latencyMs?: number; reason?: string }

async function probeDb(): Promise<ProbeResult> {
  const started = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'ok', latencyMs: Date.now() - started }
  } catch (err) {
    return { status: 'fail', latencyMs: Date.now() - started, reason: (err as Error).message }
  }
}

function probeRedis(): ProbeResult {
  // isRedisHealthy() reflects the singleton client's last-known state — Redis
  // is best-effort cache, so a 'fail' here doesn't 503 by default.
  return isRedisHealthy() ? { status: 'ok' } : { status: 'fail', reason: 'redis client not healthy' }
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const query = getQuery(event)
  const deep = query.deep === '1' || query.deep === 'true'

  if (!deep) {
    return { status: 'ok', mode: 'shallow', uptimeSeconds: Math.round(process.uptime()) }
  }

  const [db, redis] = [await probeDb(), probeRedis()]
  const dbOk = db.status === 'ok'

  if (!dbOk) {
    log.error('deep.fail', { db, redis })
    setResponseStatus(event, 503)
    return { status: 'fail', mode: 'deep', db, redis, uptimeSeconds: Math.round(process.uptime()) }
  }

  return { status: 'ok', mode: 'deep', db, redis, uptimeSeconds: Math.round(process.uptime()) }
})
