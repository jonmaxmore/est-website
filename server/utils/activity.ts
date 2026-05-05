/**
 * ═══ Activity Logger ═══
 * บันทึกประวัติการทำงานของ admin ทุกคน (audit trail)
 *
 * Fire-and-forget: returns immediately; the DB write happens in the background.
 * Errors are swallowed and logged via the structured logger so the audit trail
 * never blocks or breaks the primary admin operation.
 *
 * Callers may keep `await logActivity(...)` — the awaited value is undefined,
 * which is harmless.
 */
import type { H3Event } from 'h3'
import { logger } from './logger'

const log = logger.child({ scope: 'activity' })

export function logActivity(
  event: H3Event,
  action: string,
  resource: string,
  details?: string,
  resourceId?: string,
): void {
  // Snapshot the request-scoped data synchronously before the request goes away
  const ipAddress = getRequestIP(event, { xForwardedFor: true }) || null

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
