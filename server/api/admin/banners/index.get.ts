/**
 * GET /api/admin/banners — List marketing banners (with optional filters)
 *
 * Note: ยังคืน array ตรงๆ เพื่อ compat กับ admin/banners.vue เดิม
 * Future: switch to paginated() helper from utils/response.ts when admin pages
 * adopt the same shape used by public/news.
 */
import { reconcileBannerStatuses } from '../../../utils/banner-expiry'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Auto-transition banner statuses ก่อนอ่าน (throttled — at most once per 60s)
  await reconcileBannerStatuses()

  const where: Record<string, unknown> = {}
  if (query.placement) where.placement = query.placement
  if (query.scope) where.scope = query.scope
  if (query.campaignCode) where.campaignCode = query.campaignCode

  // Default: hide EXPIRED unless explicitly requested
  // ?status=EXPIRED → see only expired
  // ?status=all → see everything
  // (ไม่ส่ง status) → ซ่อน EXPIRED
  if (query.status && query.status !== 'all') {
    where.status = query.status
  } else if (!query.status) {
    where.status = { not: 'EXPIRED' }
  }

  return prisma.marketingBanner.findMany({
    where,
    include: {
      article: { select: { id: true, slug: true, titleEn: true, titleTh: true } },
      page: { select: { key: true, slug: true, titleEn: true, titleTh: true } },
    },
    orderBy: [{ placement: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
    take: 200,
  })
})
