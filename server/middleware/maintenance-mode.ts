/**
 * ═══ Maintenance Mode Gate ═══
 * Return 503 + maintenance page for public requests when siteConfig.maintenance.enabled = true.
 *
 * Bypass:
 *  - /api/health, /api/admin/*, /admin/*  (operators must reach the dashboard during incidents)
 *  - /_nuxt, /__nuxt, asset paths         (HTML page imports its own CSS/JS)
 *  - Authenticated admin sessions         (operator browsing the public site is fine)
 *  - Header `x-maintenance-bypass: <env MAINTENANCE_BYPASS_TOKEN>` for canary checks
 *
 * Audit-3 (DevOps-1 M3): config existed but had no enforcement — toggling
 * maintenance.enabled in admin/settings did nothing visible. This wires it.
 *
 * Performance: in-process cache with 30s TTL — checking siteConfig on every
 * request would add a Postgres roundtrip to the hot path. 30s lag is acceptable
 * for a tool only used during planned incidents/upgrades.
 */
import { logger } from '../utils/logger'

const log = logger.child({ scope: 'maintenance' })

type MaintenanceConfig = { enabled: boolean; messageEn?: string; messageTh?: string }

let cachedConfig: MaintenanceConfig = { enabled: false }
let cachedAt = 0
const CACHE_TTL_MS = 30_000

async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  const now = Date.now()
  if (now - cachedAt < CACHE_TTL_MS) return cachedConfig

  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'maintenance' } })
    const value = (row?.value ?? null) as MaintenanceConfig | null
    cachedConfig = value && typeof value === 'object' && 'enabled' in value
      ? { enabled: !!value.enabled, messageEn: value.messageEn, messageTh: value.messageTh }
      : { enabled: false }
    cachedAt = now
  } catch (err) {
    // DB unreachable → fail open (don't 503 the whole site if Postgres flaps).
    log.warn('config-lookup-failed', { err: (err as Error).message })
  }
  return cachedConfig
}

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Bypass paths that operators need during an incident.
  if (
    path === '/api/health' ||
    path.startsWith('/api/admin') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/admin') ||
    path.startsWith('/_nuxt') ||
    path.startsWith('/__nuxt') ||
    /\.(js|css|png|jpg|webp|avif|svg|ico|woff2?|ttf|map)$/i.test(path)
  ) {
    return
  }

  const config = await getMaintenanceConfig()
  if (!config.enabled) return

  // Authenticated admin session bypasses maintenance.
  const session = await getUserSession(event).catch(() => null)
  if (session?.user) return

  // Header bypass for canary checks (env-controlled).
  const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN
  if (bypassToken) {
    const provided = getHeader(event, 'x-maintenance-bypass')
    if (provided && provided === bypassToken) return
  }

  setResponseStatus(event, 503)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'Retry-After', '600')

  // For API requests respond JSON; otherwise minimal HTML.
  if (path.startsWith('/api/')) {
    return {
      error: 'maintenance',
      messageEn: config.messageEn || 'Site is under maintenance — please check back shortly.',
      messageTh: config.messageTh || 'ระบบกำลังปิดปรับปรุง กรุณากลับมาใหม่ในไม่ช้า',
    }
  }

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  const titleEn = 'Maintenance'
  const titleTh = 'ปิดปรับปรุง'
  const messageEn = config.messageEn || 'We are improving the site — please check back shortly.'
  const messageTh = config.messageTh || 'เรากำลังปรับปรุงระบบ กรุณากลับมาใหม่ในไม่ช้า'
  return `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${titleTh} · ${titleEn}</title>
    <style>
      :root { color-scheme: dark; }
      html,body { margin:0; padding:0; min-height:100vh; background:#0c0a14; color:#fff; font-family:system-ui,-apple-system,sans-serif; }
      main { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; padding:24px; text-align:center; }
      h1 { font-size:2rem; margin:0 0 16px; color:#d4a843; }
      p { font-size:1rem; color:rgba(255,255,255,0.72); max-width:560px; margin:6px 0; line-height:1.6; }
    </style>
  </head>
  <body>
    <main role="main" aria-live="polite">
      <h1>${titleTh} · ${titleEn}</h1>
      <p lang="th">${messageTh}</p>
      <p lang="en">${messageEn}</p>
    </main>
  </body>
</html>`
})
