/**
 * ═══ Pageview Tracking Middleware ═══
 * เก็บสถิติการเข้าชมหน้าเว็บสาธารณะ
 *
 * หลักการ:
 * - เก็บเฉพาะหน้าสาธารณะ (ไม่เก็บ /admin, /api, static files)
 * - ใช้ SHA-256 hash ของ IP+UA+วันที่ → visitor ID ที่ไม่สามารถย้อนกลับได้
 * - salt หมุนทุกวัน → ป้องกันการ track ข้ามวัน (privacy-safe)
 * - ทำงานแบบ fire-and-forget → ไม่ทำให้โหลดหน้าช้าลง
 */
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // กรองเฉพาะ request ที่เป็นหน้าเว็บสาธารณะ
  if (path.startsWith('/api') || path.startsWith('/admin') || path.startsWith('/_nuxt') || path.startsWith('/__nuxt')) return
  if (event.method !== 'GET') return
  if (/\.(js|css|png|jpg|webp|avif|svg|ico|woff2?|ttf|map)$/i.test(path)) return

  try {
    // สร้าง visitor ID แบบ privacy-safe
    // ใช้ SHA-256 hash ของ IP + User-Agent + วันที่ (salt หมุนทุกวัน)
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const ua = getRequestHeader(event, 'user-agent') || ''
    const daySalt = new Date().toISOString().slice(0, 10) // salt หมุนทุกวัน
    const visitorId = createHash('sha256').update(`${ip}-${ua.slice(0, 50)}-${daySalt}`).digest('hex').slice(0, 32)

    // สร้าง session ID จาก cookie (ใช้ track ว่าอยู่ session เดียวกัน)
    const sessionId = getCookie(event, '__ets_sid') || `s-${Date.now().toString(36)}`
    if (!getCookie(event, '__ets_sid')) {
      setCookie(event, '__ets_sid', sessionId, { maxAge: 1800, httpOnly: true, sameSite: 'lax' })
    }

    // ⚡ Fire-and-forget: ไม่ await เพื่อไม่ให้ blocking หน้าเว็บ
    prisma.pageView.create({
      data: {
        path,
        sessionId,
        visitorId,
        referrer: getRequestHeader(event, 'referer') || null,
        userAgent: ua.slice(0, 512) || null,
      },
    }).catch(() => {
      // tracking ล้มเหลวไม่เป็นไร — ห้ามทำให้หน้าเว็บพัง
    })
  } catch {
    // ห้ามให้ tracking error ทำให้หน้าเว็บพังเด็ดขาด
  }
})
