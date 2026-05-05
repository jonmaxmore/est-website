/**
 * ═══ Admin Login API ═══
 * POST /api/auth/login
 *
 * ขั้นตอน:
 * 1. ตรวจ rate limit (ป้องกัน brute force — 10 ครั้ง/5 นาที ต่อ IP)
 * 2. validate ข้อมูลด้วย Zod schema
 * 3. หา user จาก email ใน DB
 * 4. เทียบ password กับ bcrypt hash
 * 5. อัปเดต lastLoginAt
 * 6. สร้าง session cookie
 * 7. บันทึก activity log
 */
import { z } from 'zod'

import { SESSION_TTL_MS } from '../../utils/session-policy'

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
})

// จำกัดล็อกอินผิด 10 ครั้งต่อ 5 นาทีต่อ IP (ป้องกัน brute force)
const LOGIN_LIMIT_PER_5_MINUTES = 10

export default defineEventHandler(async (event) => {
  // ── ขั้นที่ 1: ตรวจ Rate Limit ──
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(`login:${ip}`, LOGIN_LIMIT_PER_5_MINUTES, 300)
  if (!allowed) {
    logSecurityEvent(event, 'LOGIN_RATE_LIMITED', 'Login rate limit exceeded')
    throw createError({ statusCode: 429, message: 'Too many login attempts. Please try again later.' })
  }

  // ── ขั้นที่ 2: อ่านและ validate body ──
  let body: unknown
  try {
    body = await readBody(event)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, message: 'Request body must be a JSON object with email and password' })
  }

  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid credentials format' })
  }

  const { email, password } = parsed.data

  // ── ขั้นที่ 3: หา user จาก email ──
  const user = await prisma.adminUser.findUnique({
    where: { email },
  })

  // ⚠️ ส่ง error เดียวกันไม่ว่าจะเป็น email ผิดหรือ password ผิด
  //    เพื่อไม่ให้รู้ว่า email มีอยู่ในระบบหรือไม่
  if (!user) {
    logSecurityEvent(event, 'LOGIN_FAILED', `unknown email: ${email}`, {
      syntheticUserId: 'anon:login',
      syntheticUserName: email,
    })
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  // ── ขั้นที่ 4: เทียบ password ──
  const valid = await verifyAdminPassword(password, user.passwordHash)
  if (!valid) {
    logSecurityEvent(event, 'LOGIN_FAILED', `bad password for ${email}`, {
      syntheticUserId: `user:${user.id}`,
      syntheticUserName: user.displayName,
    })
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  // ── ขั้นที่ 5-7: อัปเดต, สร้าง session, บันทึก log ──
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  // 12-hour idle TTL — admin-auth.ts middleware enforces it on every
  // /api/admin/* request and slides expiresAt forward on activity.
  const now = Date.now()
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    expiresAt: now + SESSION_TTL_MS,
    issuedAt: now,
  })

  await logActivity(event, 'LOGIN', 'auth', `Admin login: ${user.email}`, user.id)

  return { success: true, user: { displayName: user.displayName, role: user.role } }
})
