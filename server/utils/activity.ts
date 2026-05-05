/**
 * ═══ Activity Logger ═══
 * บันทึกประวัติการทำงานของ admin ทุกคน (audit trail)
 *
 * Fire-and-forget: returns immediately; the DB write happens in the background.
 * Errors are swallowed and logged via the structured logger so the audit trail
 * never blocks or breaks the primary admin operation.
 *
 * IP storage: persisted in the `ipAddress` column AFTER day-salted SHA-256
 * hashing via hashIp() — raw IPs never reach the DB. Same primitive used for
 * PageView.visitorId, so cross-table linking remains possible by design but
 * never yields the underlying address (PDPA/GDPR-aligned, audit-2 finding M-1).
 *
 * Callers may keep `await logActivity(...)` — the awaited value is undefined,
 * which is harmless.
 */
import type { H3Event } from 'h3'
import { logger } from './logger'
import { hashIp } from './privacy'

const log = logger.child({ scope: 'activity' })

export function logActivity(
  event: H3Event,
  action: string,
  resource: string,
  details?: string,
  resourceId?: string,
): void {
  // Snapshot the request-scoped data synchronously before the request goes away.
  // Hash immediately so a raw IP never lives in any in-memory closure for long.
  const rawIp = getRequestIP(event, { xForwardedFor: true }) || null
  const ipAddress = rawIp ? hashIp(rawIp) : null

  void (async () => {
    try {
      const session = await getUserSession(event)
      const user = session?.user as { id: string; displayName: string } | undefined
      if (!user) return

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          userName: user.displayName || 'Unknown',
          action,
          resource,
          resourceId: resourceId || null,
          details: details || null,
          ipAddress,
        },
      })
    } catch (err) {
      log.error('write.failed', { reason: (err as Error).message, action, resource })
    }
  })()
}
