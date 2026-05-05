/**
 * ═══ News Article Scheduled-Publish Reconciliation ═══
 * Flips SCHEDULED → PUBLISHED when publishedAt has passed.
 *
 * Same demand-triggered + throttled pattern as banner-expiry.ts: invoked
 * from public read paths so a SCHEDULED article auto-promotes the next time
 * someone visits /news (or /api/public/news), without depending on an
 * external cron. The trade-off is the same — if no one reads /news for a
 * while, articles can sit in SCHEDULED past their publishedAt. Acceptable
 * for a low-traffic launch window; revisit if a hard-deadline drop matters.
 *
 * Audit-2 (M-3 + M-4): closes the "no SCHEDULED status, no worker" gap.
 */
import { prisma } from './prisma'
import { logger } from './logger'

const log = logger.child({ scope: 'news.scheduler' })

let lastReconcileMs = 0
const RECONCILE_INTERVAL_MS = 60_000

let inFlight: Promise<{ promoted: number }> | null = null

async function doReconcile(now: Date): Promise<{ promoted: number }> {
  const result = await prisma.newsArticle.updateMany({
    where: {
      status: 'SCHEDULED',
      publishedAt: { not: null, lte: now },
    },
    data: { status: 'PUBLISHED' },
  })
  if (result.count > 0) log.info('promoted', { count: result.count })
  return { promoted: result.count }
}

/**
 * Run reconciliation at most once per interval (default 60s).
 * @param force skip throttle (admin-triggered)
 */
export async function reconcileScheduledArticles(force = false): Promise<{ promoted: number }> {
  const now = Date.now()
  if (!force && now - lastReconcileMs < RECONCILE_INTERVAL_MS) {
    return { promoted: 0 }
  }
  if (inFlight) return inFlight

  lastReconcileMs = now
  inFlight = doReconcile(new Date())
    .catch((err) => {
      log.error('reconcile.failed', { reason: (err as Error).message })
      return { promoted: 0 }
    })
    .finally(() => {
      inFlight = null
    }) as Promise<{ promoted: number }>

  return inFlight
}
