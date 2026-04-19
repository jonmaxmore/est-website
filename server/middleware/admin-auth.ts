/** Protects all /api/admin/* routes — requires valid session with RBAC */
export default defineEventHandler(async (event) => {
  // Only apply to /api/admin paths
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/admin')) return

  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized — admin login required' })
  }

  const user = session.user as { id: string; role: string }

  // RBAC: Restrict destructive system operations to SUPER_ADMIN
  const superAdminOnly = [
    '/api/admin/users',       // POST (create), DELETE
    '/api/admin/backup/import',
    '/api/admin/backup/import-wp',
  ]

  const isSuperAdminRoute = superAdminOnly.some((route) => path.startsWith(route))
  const isDestructiveMethod = ['POST', 'DELETE'].includes(event.method)

  // Allow GET on user list for editors, but block create/delete
  if (isSuperAdminRoute && isDestructiveMethod && user.role !== 'SUPER_ADMIN') {
    throw createError({ statusCode: 403, message: 'Forbidden — SUPER_ADMIN role required' })
  }
})
