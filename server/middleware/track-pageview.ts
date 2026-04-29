/**
 * ═══ Pageview Tracking Middleware ═══
 * เก็บสถิติการเข้าชมหน้าเว็บสาธารณะ (PDPA-compliant)
 *
 * หลักการ:
 * - เก็บเฉพาะหน้าสาธารณะ (ไม่เก็บ /admin, /api, static files)
 * - ใช้ SHA-256 hash ของ IP+UA+วันที่ → visitor ID ที่ย้อนกลับไม่ได้
 * - User-Agent ตัดเหลือเฉพาะ browser/OS family (ไม่เก็บ minor version)
 * - Referrer ตัด query string ออก (ป้องกัน PII รั่ว)
 * - Fire-and-forget — ไม่ทำให้โหลดหน้าช้าลง
 */
import { createHash } from 'node:crypto'
import { redactReferrer, truncateUserAgent } from '../utils/privacy'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // กรองเฉพาะ request ที่เป็นหน้าเว็บสาธารณะ
  if (
    path.startsWith('/api') ||
    path.startsWith('/admin') ||
    path.startsWith('/_nuxt') ||
    path.startsWith('/__nuxt')
  ) {
    return
  }
  if (event.method !== 'GET') return
  if (/\.(js|css|png|jpg|webp|avif|svg|ico|woff2?|ttf|map)$/i.test(path)) return

  try {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const ua = getRequestHeader(event, 'user-agent') || ''
    const daySalt = new Date().toISOString().slice(0, 10)
    const visitorId = createHash('sha256')
      .update(`${ip}-${ua.slice(0, 50)}-${daySalt}`)
      .digest('hex')
      .slice(0, 32)

    const sessionId = getCookie(event, '__ets_sid') || `s-${Date.now().toString(36)}`
    if (!getCookie(event, '__ets_sid')) {
      setCookie(event, '__ets_sid', sessionId, { maxAge: 1800, httpOnly: true, sameSite: 'lax' })
    }

    // ── PDPA: ตัด PII ──
    const safeReferrer = redactReferrer(getRequestHeader(event, 'referer'))
    const safeUserAgent = truncateUserAgent(ua)

    // Fire-and-forget — ห้ามทำให้หน้าเว็บพัง
    prisma.pageView
      .create({
        data: {
          path,
          sessionId,
          visitorId,
          referrer: safeReferrer,
          userAgent: safeUserAgent,
        },
      })
      .catch(() => {
        /* tracking ล้มเหลวไม่กระทบ user */
      })
  } catch {
    /* never throw */
  }
})
