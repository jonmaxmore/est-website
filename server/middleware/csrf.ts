/**
 * ═══ CSRF defense (Origin / Referer check) ═══
 *
 * Cookie-based sessions (sameSite=lax) already block third-party cross-site
 * POST in modern browsers, but a top-level form submission via
 * <form action="https://oursite/api/admin/..."> is still allowed by lax. To
 * close that gap without forcing a token-rotation flow, we verify on every
 * mutating /api/admin/* request that the Origin (or Referer) header points
 * back at our own host.
 *
 * Why per-host (not per-allowlist): production runs behind nginx that
 * proxy-passes the Host header through (docker/nginx/default.conf:79),
 * so the request's `host` header reflects whatever the user actually typed.
 * That's the same value the browser uses to compute Origin, so an attacker
 * page on attacker.com can never match — the browser stamps Origin with
 * `attacker.com`, our `host` header is `oursite`. Mismatch → 403.
 *
 * /api/admin/* is the only surface that mutates state via cookie auth, so we
 * limit scope to it. /api/auth/login is GET-tolerant + already rate-limited;
 * /api/track and /api/integration/webhook use their own auth paths.
 *
 * Order: this runs BEFORE admin-auth.ts because Nitro runs middleware
 * alphabetically — `csrf.ts` < `admin-auth.ts` < `request-id.ts` etc. The
 * order isn't load-bearing (both reject the request) but ordering CSRF
 * first means we don't even consult the session for cross-origin attempts.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function hostnameOf(value: string | undefined): string | null {
  if (!value) return null
  try {
    return new URL(value).host.toLowerCase()
  } catch {
    return null
  }
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/admin')) return

  if (SAFE_METHODS.has(event.method)) return

  const expectedHost = (getRequestHeader(event, 'host') || '').toLowerCase()
  if (!expectedHost) {
    throw createError({ statusCode: 400, message: 'Missing Host header' })
  }

  const origin = hostnameOf(getRequestHeader(event, 'origin'))
  const referer = hostnameOf(getRequestHeader(event, 'referer'))

  // Browsers always send Origin on cross-origin POST/PUT/DELETE. Some
  // same-origin form submissions don't, in which case Referer is the
  // fallback. Reject if NEITHER is present — that's most likely a hand-
  // crafted attack request, not a real browser flow.
  if (!origin && !referer) {
    throw createError({ statusCode: 403, message: 'CSRF: missing Origin and Referer' })
  }

  if (origin && origin !== expectedHost) {
    throw createError({ statusCode: 403, message: 'CSRF: Origin mismatch' })
  }
  if (!origin && referer && referer !== expectedHost) {
    throw createError({ statusCode: 403, message: 'CSRF: Referer mismatch' })
  }
})
