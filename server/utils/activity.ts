/**
 * ═══ Activity Logger ═══
 * บันทึกประวัติการทำงานของ admin ทุกคน (audit trail)
 *
 * ใช้ตอน: สร้าง/แก้/ลบเนื้อหา, login, upload ไฟล์ ฯลฯ
 * เก็บ: ใคร (userId), ทำอะไร (action), กับอะไร (resource), เมื่อไหร่, IP
 *
 * ⚠️ ห้ามให้ log error ทำให้ operation หลักล้มเหลว (try-catch ครอบไว้)
 */
import type { H3Event } from 'h3'

export async function logActivity(
  event: H3Event,
  action: string,
  resource: string,
  details?: string,
  resourceId?: string,
) {
  try {
    const session = await getUserSession(event)
    const user = session?.user as { id: string; displayName: string } | undefined
    if (!user) return

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.displayName || 'Unknown',
        action,
        resource,
        resourceId: resourceId || null,
        details: details || null,
        ipAddress: getRequestIP(event, { xForwardedFor: true }) || null,
      },
    })
  } catch (err) {
    // ห้ามให้ activity log ทำให้ operation หลักพัง
    console.error('[ActivityLog] Failed to log:', err)
  }
}
