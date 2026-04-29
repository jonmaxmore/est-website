/**
 * GET /api/admin/banners — List marketing banners (with optional filters)
 *
 * Note: ยังคืน array ตรงๆ เพื่อ compat กับ admin/banners.vue เดิม
 * เมื่อ refactor ใช้ useAdminCRUD เปลี่ยนเป็น { data, meta } ได้
 */
import { reconcileBannerStatuses } from '../../../utils/banner-expiry'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Auto-transition banner statuses ก่อนอ่าน (throttled — at most once per 60s)
  await reconcileBannerStatuses()

  const where: Record<string, unknown> = {}
  if (query.placement) where.placement = query.placement
  if (query.status) where.status = query.status
  if (query.scope) where.scope = query.scope
  if (query.campaignCode) where.campaignCode = query.campaignCode

  return prisma.marketingBanner.findMany({
    where,
    include: {
      article: { select: { id: true, slug: true, titleEn: true, titleTh: true } },
      page: { select: { key: true, slug: true, titleEn: true, titleTh: true } },
      event: { select: { id: true, titleEn: true, titleTh: true, startsAt: true, endsAt: true } },
    },
    orderBy: [{ placement: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
    take: 200,
  })
})
