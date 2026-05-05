/**
 * ═══ Marketing Banner Resolver ═══
 * เลือกแบนเนอร์ที่เหมาะสมที่สุดสำหรับแต่ละหน้าและตำแหน่ง
 *
 * หลักการทำงาน:
 * 1. กรอง banner ที่ scope ตรงกับหน้าปัจจุบัน + status=LIVE + อยู่ในช่วงเวลา
 * 2. ถ้ามีหลายตัวชิงตำแหน่งเดียวกัน → เลือกตาม priority > updatedAt > id
 * 3. คืน map ของ placement → banner
 */
import { BANNER_PLACEMENTS, type BannerPlacement } from '../../app/shared/cms/marketing-banners'

type BannerScope =
  | 'global'
  | 'homepage'
  | 'news_index'
  | 'article_detail'
  | 'topic_page'
  | 'specific_article'
  | 'specific_topic'

export type BannerRouteType = 'homepage' | 'news_index' | 'article_detail' | 'topic_page'

export type BannerRecord = {
  id: string
  placement: BannerPlacement
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'EXPIRED'
  scope: BannerScope
  priority: number
  isActive: boolean
  startsAt: Date | null
  endsAt: Date | null
  updatedAt: Date
  targetArticleId?: number | null
  targetTopicKey?: string | null
  config: Record<string, unknown>
}

type ResolveInput = {
  now: Date
  routeType: BannerRouteType
  articleId?: number | null
  topicKey?: string | null
  banners: BannerRecord[]
}

export type ResolvedBannerMap<T extends BannerRecord = BannerRecord> = Record<BannerPlacement, T | null>

function createEmptyResult<T extends BannerRecord>() {
  return Object.fromEntries(BANNER_PLACEMENTS.map((placement) => [placement, null])) as ResolvedBannerMap<T>
}

/** ตรวจว่า banner ตรงเงื่อนไขกับหน้าปัจจุบันหรือไม่ */
function bannerMatches(input: ResolveInput, banner: BannerRecord) {
  if (!banner.isActive || banner.status !== 'LIVE') return false
  if (banner.startsAt && banner.startsAt > input.now) return false
  if (banner.endsAt && banner.endsAt <= input.now) return false
  if (banner.scope === 'global') return true
  if (banner.scope === input.routeType) return true

  if (banner.scope === 'specific_article' && input.routeType === 'article_detail') {
    return banner.targetArticleId === input.articleId
  }

  if (banner.scope === 'specific_topic' && input.routeType === 'topic_page') {
    return String(banner.targetTopicKey || '') === String(input.topicKey || '')
  }

  return false
}

/**
 * เปรียบเทียบ 2 banner ว่าตัวไหนชนะ (แสดงก่อน)
 * ลำดับ: priority สูงกว่า > อัปเดทล่าสุด > id ตัวเล็กกว่า (เพื่อความเสถียร)
 */
function bannerWins(candidate: BannerRecord, current: BannerRecord | null) {
  if (!current) return true
  if (candidate.priority !== current.priority) return candidate.priority > current.priority
  if (candidate.updatedAt.getTime() !== current.updatedAt.getTime()) return candidate.updatedAt > current.updatedAt
  return candidate.id < current.id
}

/** เลือก banner ที่ดีที่สุดสำหรับแต่ละตำแหน่งในหน้าปัจจุบัน */
export function resolveMarketingBanners<T extends BannerRecord>(input: ResolveInput & { banners: T[] }) {
  const resolved = createEmptyResult<T>()

  for (const banner of input.banners) {
    if (!bannerMatches(input, banner)) continue

    const current = resolved[banner.placement]
    if (bannerWins(banner, current)) {
      resolved[banner.placement] = banner
    }
  }

  return resolved
}
