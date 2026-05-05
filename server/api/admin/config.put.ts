/**
 * ═══ Site Config Upsert API ═══
 * PUT /api/admin/config
 *
 * บันทึกการตั้งค่าเว็บไซต์ (navigation, SEO, appearance ฯลฯ)
 *
 * Flow:
 * 1. Validate body ด้วย Zod (key + value)
 * 2. Normalize value ด้วย parseAdminConfigWrite (admin-config.ts)
 * 3. Upsert ลง DB (siteConfig)
 * 4. บันทึก activity log
 */
import { z } from 'zod'

import { parseAdminConfigWrite } from '../../utils/admin-config'
import { cacheInvalidate } from '../../utils/redis'
import { SUPER_ADMIN_CONFIG_KEYS } from '../../utils/session-policy'

const configSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = configSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  // ── Per-key RBAC: integrations + maintenance are SUPER_ADMIN-only ──
  // EDITOR can edit content + appearance keys (seo, social, navigation,
  // appearance, homepage_sections, webzine_topics, faq, download_page).
  if (SUPER_ADMIN_CONFIG_KEYS.has(parsed.data.key)) {
    const session = await getUserSession(event)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'SUPER_ADMIN') {
      throw createError({
        statusCode: 403,
        message: `Forbidden — config key "${parsed.data.key}" requires SUPER_ADMIN role`,
      })
    }
  }

  let configInput: ReturnType<typeof parseAdminConfigWrite>

  try {
    configInput = parseAdminConfigWrite(parsed.data)
  } catch (error) {
    throw createError({ statusCode: 422, message: (error as Error).message })
  }

  const config = await prisma.siteConfig.upsert({
    where: { key: configInput.key },
    update: { value: configInput.value as object },
    create: { key: configInput.key, value: configInput.value as object },
  })

  // ── Invalidate cache ของ config ──
  await cacheInvalidate(`config:${configInput.key}*`)
  await cacheInvalidate('site:*')

  await logActivity(
    event,
    'UPDATE',
    'config',
    `Updated config: ${configInput.key}`,
    configInput.key,
  )

  return config
})

