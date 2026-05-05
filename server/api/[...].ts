// ═══════════════════════════════════════
// API Catch-All — Returns JSON 404 for undefined API routes
// ═══════════════════════════════════════
// Without this handler, POSTing to a non-existent API route (e.g., POST /)
// returns the homepage HTML with status 200, confusing automated test tools.
// This middleware intercepts all /api/* requests that don't match a defined
// route and returns a proper JSON error response.

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Only intercept /api/* routes that weren't matched by a handler
  if (path.startsWith('/api/')) {
    const method = getMethod(event)

    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `API endpoint ${method} ${path} does not exist`,
      data: {
        error: 'NOT_FOUND',
        path,
        method,
        availableEndpoints: [
          'GET /api/public/banners',
          'GET /api/public/download-page',
          'GET /api/public/features',
          'GET /api/public/highlights',
          'GET /api/public/milestones',
          'GET /api/public/news',
          'GET /api/public/news/:slug',
          'GET /api/public/pages/:key',
          'GET /api/public/sections',
          'GET /api/public/site',
          'GET /api/public/weapons',
          'GET /api/public/webzine/landing',
          'POST /api/auth/login',
          'POST /api/track',
          'POST /api/integration/webhook',
        ],
      },
    })
  }
})
