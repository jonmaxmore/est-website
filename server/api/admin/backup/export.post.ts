/**
 * POST /api/admin/backup/export — Export site content เป็น JSON
 *
 * ⚠️ Disaster recovery ใช้ pg_dump (ดู scripts/backup-db.sh)
 * ไฟล์ JSON นี้เก็บเฉพาะเนื้อหา CMS — ไม่เหมาะสำหรับ full restore
 *
 * Schema version: 3.0 — dropped events + registrations (post-launch cleanup)
 *   1.0 → 2.0: added banners, events, milestones
 *   2.0 → 3.0: removed events + registrations (GameEvent and PreRegistration
 *              models retired at official launch)
 */
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const EXPORT_SCHEMA_VERSION = '3.0'
const FIND_LIMIT = 5000

const exportRequestSchema = z.object({
  news: z.boolean().optional(),
  weapons: z.boolean().optional(),
  config: z.boolean().optional(),
  users: z.boolean().optional(),
  features: z.boolean().optional(),
  highlights: z.boolean().optional(),
  pages: z.boolean().optional(),
  media: z.boolean().optional(),
  banners: z.boolean().optional(),
  milestones: z.boolean().optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const parsed = exportRequestSchema.safeParse(raw ?? {})
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Invalid export selection', data: parsed.error.flatten() })
  }
  const body = parsed.data
  const result: Record<string, unknown> = {
    _meta: {
      exportedAt: new Date().toISOString(),
      version: EXPORT_SCHEMA_VERSION,
      limit: FIND_LIMIT,
      note: 'Content snapshot — use pg_dump for disaster recovery',
    },
  }

  if (body.news) {
    result.news = await prisma.newsArticle.findMany({ take: FIND_LIMIT, orderBy: { id: 'asc' } })
  }
  if (body.weapons) {
    result.weapons = await prisma.weapon.findMany({ orderBy: { id: 'asc' } })
  }
  if (body.config) {
    result.config = await prisma.siteConfig.findMany()
  }
  if (body.users) {
    result.users = await prisma.adminUser.findMany({
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
    })
  }
  if (body.features) {
    result.features = await prisma.feature.findMany({ orderBy: { sortOrder: 'asc' } })
  }
  if (body.highlights) {
    result.highlights = await prisma.highlight.findMany({ orderBy: { sortOrder: 'asc' } })
  }
  if (body.pages) {
    result.pages = await prisma.pageContent.findMany({
      orderBy: [{ isSystemPage: 'desc' }, { updatedAt: 'desc' }],
    })
  }
  if (body.media) {
    result.media = await prisma.mediaAsset.findMany({
      take: FIND_LIMIT,
      orderBy: { createdAt: 'desc' },
    })
  }
  if (body.banners) {
    result.banners = await prisma.marketingBanner.findMany({ take: FIND_LIMIT, orderBy: { id: 'asc' } })
  }
  if (body.milestones) {
    result.milestones = await prisma.milestone.findMany({ orderBy: { tier: 'asc' } })
  }

  await logActivity(
    event,
    'EXPORT',
    'backup',
    `Exported v${EXPORT_SCHEMA_VERSION}: ${Object.keys(result).filter((k) => k !== '_meta').join(', ')}`,
  )

  setResponseHeaders(event, {
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="ets-backup-v${EXPORT_SCHEMA_VERSION}-${new Date().toISOString().slice(0, 10)}.json"`,
  })

  // Prisma Decimal/BigInt serialization safety
  return JSON.parse(
    JSON.stringify(result, (_k, v) => (typeof v === 'bigint' ? Number(v) : v instanceof Prisma.Decimal ? v.toString() : v)),
  )
})
