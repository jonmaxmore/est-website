/**
 * POST /api/auth/logout — clear admin session cookie
 *
 * Audit-2 (M-3) flagged the absence of a logout endpoint: stolen sessions
 * couldn't be revoked from the user side because the admin-auth middleware
 * only cleared sessions on TTL expiry, not on demand.
 *
 * Idempotent: returns success whether or not a session existed. Logs a
 * LOGOUT activity row only when an authenticated session is actually
 * cleared (so unauthenticated probe requests don't pollute the audit feed).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session?.user as { id: string; email?: string } | undefined

  if (user) {
    // Log BEFORE clearing the session so logActivity can read it
    logActivity(event, 'LOGOUT', 'auth', `Admin logout: ${user.email ?? user.id}`, user.id)
  }

  await clearUserSession(event)
  return { success: true }
})
