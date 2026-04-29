/**
 * ═══ Banner Status Reconciliation ═══
 * อัพเดทสถานะ banner อัตโนมัติตามเวลา:
 *   - SCHEDULED + startsAt <= now  → LIVE
 *   - LIVE + endsAt <= now         → EXPIRED
 *
 * เรียกแบบ throttled (อย่างน้อย 60 วิ) ก่อนอ่าน banners
 * — ถูกใช้ใน server/api/public/banners.get.ts และ admin list endpoint
 */
import { prisma } from './prisma'

let lastReconcileMs = 0
const RECONCILE_INTERVAL_MS = 60_000

let inFlight: Promise<void> | null = null

async function doReconcile(now: Date): Promise<void> {
  await prisma.$transaction([
    prisma.marketingBanner.updateMany({
      where: {
        status: 'SCHEDULED',
        startsAt: { not: null, lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      data: { status: 'LIVE' },
    }),
    prisma.marketingBanner.updateMany({
      where: {
        status: 'LIVE',
        endsAt: { not: null, lte: now },
      },
      data: { status: 'EXPIRED' },
    }),
  ])
}

/**
 * Run reconciliation at most once per interval (default 60s)
 * @param force ข้าม throttle (admin-triggered)
 */
export async function reconcileBannerStatuses(force = false): Promise<void> {
  const now = Date.now()
  if (!force && now - lastReconcileMs < RECONCILE_INTERVAL_MS) return
  if (inFlight) return inFlight

  lastReconcileMs = now
  inFlight = doReconcile(new Date())
    .catch((err) => {
      console.error('[BannerExpiry] Reconcile failed:', (err as Error).message)
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}
