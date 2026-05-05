/**
 * ═══ Admin Auth Middleware ═══
 * ป้องกันทุก route /api/admin/* — ต้อง login ก่อนเข้าถึง
 *
 * ระบบสิทธิ์ (RBAC):
 * - EDITOR: ใช้งานทั่วไป (CRUD เนื้อหา + appearance)
 * - SUPER_ADMIN: ทำทุกอย่าง + จัดการ user + import/backup
 *
 * route ที่จำกัดเฉพาะ SUPER_ADMIN:
 * - /api/admin/users (สร้าง/แก้/ลบ user)
 * - /api/admin/backup/import (นำเข้าข้อมูล)
 * - /api/admin/backup/import-wp (นำเข้าจาก WordPress)
 *
 * เพิ่มเติม: /api/admin/config มี per-key role check ภายใน handler
 * (server/api/admin/config.put.ts) สำหรับ key ที่อยู่ใน
 * SUPER_ADMIN_CONFIG_KEYS (เช่น integrations, maintenance).
 *
 * Session TTL:
 * - 12 ชั่วโมง idle (sliding) — login.post.ts ตั้ง expiresAt + issuedAt
 *   ตอนสร้าง session, middleware ตรวจ expiresAt และ slide ทุก
 *   ~5 นาที (SESSION_SLIDE_INTERVAL_MS).
 */
import { SESSION_SLIDE_INTERVAL_MS, SESSION_TTL_MS } from '../utils/session-policy'

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

  // ── TTL check + sliding renewal ──
  // expiresAt อาจไม่มี (session ที่สร้างก่อน TTL feature) — ในเคสนั้น
  // ผ่านได้ + slide เพื่ออัปเกรด session ให้มี TTL
  const now = Date.now()
  const expiresAt = (session as { expiresAt?: number }).expiresAt
  if (typeof expiresAt === 'number' && now > expiresAt) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, message: 'Session expired — please log in again' })
  }

  const issuedAt = (session as { issuedAt?: number }).issuedAt ?? 0
  if (now - issuedAt > SESSION_SLIDE_INTERVAL_MS) {
    await setUserSession(event, {
      ...session,
      expiresAt: now + SESSION_TTL_MS,
      issuedAt: now,
    })
  }

  // ── RBAC: route ที่ต้องเป็น SUPER_ADMIN เท่านั้น ──
  const superAdminOnly = [
    '/api/admin/users',       // POST (สร้าง user), PUT (แก้ user), DELETE (ลบ user)
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
