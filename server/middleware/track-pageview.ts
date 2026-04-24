/** Track page views for public pages (not /admin, not /api) */
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Only track public page requests, not APIs or admin
  if (path.startsWith('/api') || path.startsWith('/admin') || path.startsWith('/_nuxt') || path.startsWith('/__nuxt')) return
  // Only track GET requests (page navigations)
  if (event.method !== 'GET') return
  // Skip static assets
  if (/\.(js|css|png|jpg|webp|avif|svg|ico|woff2?|ttf|map)$/i.test(path)) return

  try {
    // Generate a privacy-safe visitor ID: SHA-256 hash of IP+UA with daily rotating salt
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const ua = getRequestHeader(event, 'user-agent') || ''
    const daySalt = new Date().toISOString().slice(0, 10) // rotates daily
    const visitorId = createHash('sha256').update(`${ip}-${ua.slice(0, 50)}-${daySalt}`).digest('hex').slice(0, 32)

    // Generate session ID from cookie or a hash
    const sessionId = getCookie(event, '__ets_sid') || `s-${Date.now().toString(36)}`
    if (!getCookie(event, '__ets_sid')) {
      setCookie(event, '__ets_sid', sessionId, { maxAge: 1800, httpOnly: true, sameSite: 'lax' })
    }

    // Fire-and-forget: don't await to avoid slowing down page loads
    prisma.pageView.create({
      data: {
        path,
        sessionId,
        visitorId,
        referrer: getRequestHeader(event, 'referer') || null,
        userAgent: ua.slice(0, 512) || null,
      },
    }).catch(() => {
      // Silently ignore tracking failures
    })
  } catch {
    // Never let tracking break the page
  }
})
