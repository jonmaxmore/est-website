/**
 * ═══ Admin Auth Middleware ═══
 * ป้องกันทุก route /api/admin/* — ต้อง login ก่อนเข้าถึง
 *
 * ระบบสิทธิ์ (RBAC):
 * - ADMIN: ใช้งานทั่วไป (CRUD เนื้อหา)
 * - SUPER_ADMIN: ทำทุกอย่าง + จัดการ user + import/backup
 *
 * route ที่จำกัดเฉพาะ SUPER_ADMIN:
 * - /api/admin/users (สร้าง, ลบ)
 * - /api/admin/backup/import (นำเข้าข้อมูล)
 * - /api/admin/backup/import-wp (นำเข้าจาก WordPress)
 */
export default defineEventHandler(async (event) => {
  // ใช้เฉพาะ /api/admin paths เท่านั้น
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/admin')) return

  // ตรวจว่า login แล้วหรือยัง
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Unauthorized — admin login required' })
  }

  const user = session.user as { id: string; role: string }

  // ── RBAC: route ที่ต้องเป็น SUPER_ADMIN เท่านั้น ──
  const superAdminOnly = [
    '/api/admin/users',       // POST (สร้าง user), DELETE (ลบ user)
    '/api/admin/backup/import',
    '/api/admin/backup/import-wp',
  ]

  const isSuperAdminRoute = superAdminOnly.some((route) => path.startsWith(route))
  const isDestructiveMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.method)

  // อนุญาต GET (ดูรายชื่อ user) แต่ปฏิเสธ POST/DELETE ถ้าไม่ใช่ SUPER_ADMIN
  if (isSuperAdminRoute && isDestructiveMethod && user.role !== 'SUPER_ADMIN') {
    throw createError({ statusCode: 403, message: 'Forbidden — SUPER_ADMIN role required' })
  }
})
