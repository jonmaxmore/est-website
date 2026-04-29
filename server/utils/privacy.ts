/**
 * ═══ Privacy / PDPA helpers ═══
 * เครื่องมือลด PII ใน analytics tracking ให้สอดคล้อง PDPA / GDPR
 *
 * - hashIp: hash IP ด้วย salt (ย้อนกลับไม่ได้, ไม่ identify บุคคล)
 * - truncateUserAgent: เก็บเฉพาะ family/major version (Chrome 120, ไม่ใช่ Chrome 120.0.6099.71 + OS)
 * - redactReferrer: ลบ query string ออก (อาจมี email, token, PII)
 *
 * ⚠️ ANALYTICS_IP_SALT ต้อง rotate ทุกเดือน (ใน .env บนเครื่อง prod)
 */
import { createHash } from 'node:crypto'

const FALLBACK_SALT = 'dev-only-salt-do-not-use-in-prod'

function getSalt(): string {
  const salt = process.env.ANALYTICS_IP_SALT
  if (!salt) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Privacy] ANALYTICS_IP_SALT must be set in production')
    }
    return FALLBACK_SALT
  }
  return salt
}

/**
 * Hash IP address ให้เป็น identifier ที่ย้อนกลับไม่ได้
 * รวมวันที่ลงไปด้วย → IP เดียวกันคนละวัน = hash คนละค่า (ไม่ track ข้ามวัน)
 */
export function hashIp(ip: string): string {
  if (!ip || ip === 'unknown') return 'unknown'
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${ip}|${day}|${getSalt()}`).digest('hex').slice(0, 32)
}

/**
 * ตัด User-Agent string ให้สั้น เก็บเฉพาะ browser+OS family (ไม่เก็บ minor version)
 * ตัวอย่าง:
 *   "Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/120.0.6099.71 Safari/537.36"
 *   → "Chrome/120 Windows"
 */
export function truncateUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null
  const trimmed = ua.slice(0, 256)

  const browser = trimmed.match(/(Chrome|Firefox|Safari|Edge|Edg|Opera|OPR|MSIE|Trident)\/(\d+)/i)
  const os =
    trimmed.match(/Windows(?: NT [\d.]+)?/)?.[0]?.startsWith('Windows')
      ? 'Windows'
      : /Mac OS X/i.test(trimmed)
        ? 'macOS'
        : /Android/i.test(trimmed)
          ? 'Android'
          : /iPhone|iPad|iPod/i.test(trimmed)
            ? 'iOS'
            : /Linux/i.test(trimmed)
              ? 'Linux'
              : 'Other'

  if (!browser) return `Unknown ${os}`
  return `${browser[1]}/${browser[2]} ${os}`
}

/**
 * ลบ query string + fragment ออกจาก referrer URL
 * เก็บเฉพาะ origin + pathname (ไม่เก็บ token, email, search params)
 */
export function redactReferrer(referrer: string | null | undefined): string | null {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    return `${url.origin}${url.pathname}`.slice(0, 256)
  } catch {
    return null
  }
}
