/** Protects all /api/admin/* routes — requires valid session */
export default defineEventHandler(async (event) => {
  // Only apply to /api/admin paths
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/admin')) return

  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized — admin login required' })
  }
})
