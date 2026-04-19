import type { H3Event } from 'h3'

/**
 * Log an admin activity for audit trail.
 * Called from all admin CRUD operations.
 */
export async function logActivity(
  event: H3Event,
  action: string,
  resource: string,
  details?: string,
  resourceId?: string,
) {
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
        ipAddress: getRequestIP(event, { xForwardedFor: true }) || null,
      },
    })
  } catch (err) {
    // Never let activity logging break the main operation
    console.error('[ActivityLog] Failed to log:', err)
  }
}
