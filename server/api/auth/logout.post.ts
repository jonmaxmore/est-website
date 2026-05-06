/**
 * POST /api/auth/logout — clear admin session cookie
 *
 * Audit-2 (M-3) flagged the absence of a logout endpoint: stolen sessions
 * couldn't be revoked from the user side because the admin-auth middleware
 * only cleared sessions on TTL expiry, not on demand.
 *
 * Idempotent: returns success whether or not a session existed.
 *
 * Audit-3 (QA-2 MAJOR): use logSecurityEvent with synchronously-snapshotted
 * user info instead of logActivity. logActivity reads the session inside an
 * async IIFE that may run after clearUserSession completes — losing the
 * LOGOUT row. logSecurityEvent takes synthetic actor data eagerly so the
 * audit trail is durable regardless of fire-and-forget timing.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session?.user as { id: string; email?: string; displayName?: string } | undefined

  if (user) {
    logSecurityEvent(event, 'LOGOUT', `Admin logout: ${user.email ?? user.id}`, {
      syntheticUserId: `user:${user.id}`,
      syntheticUserName: user.displayName || user.email || 'Unknown',
    })
  }

  await clearUserSession(event)
  return { success: true }
})
