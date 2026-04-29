import { computed } from 'vue'

type Banner = Record<string, any> | null

type ResolvedBannerMap = {
  announcement_bar: Banner
  popup: Banner
  floating: Banner
  homepage_inline: Banner
  sidebar: Banner
  article_inline: Banner
  footer_strip: Banner
}

const emptyResolvedBanners = (): ResolvedBannerMap => ({
  announcement_bar: null,
  popup: null,
  floating: null,
  homepage_inline: null,
  sidebar: null,
  article_inline: null,
  footer_strip: null,
})

export function useResolvedBanners(params: { routeType: string; articleId?: number | null; topicKey?: string | null }) {
  return useFetch<ResolvedBannerMap>('/api/public/banners', {
    query: params,
    default: emptyResolvedBanners,
  })
}

/**
 * Orchestrator: ใช้แทน useResolvedBanners ในหน้าที่ mount หลาย placement
 *
 * Rules:
 *  - popup และ floating ห้ามแสดงพร้อมกัน — popup ชนะถ้ามี (less noise)
 *  - footer_strip ลดโทนถ้ามี announcement_bar (ทั้งคู่เป็น sitewide promotion)
 *  - inline placements (homepage_inline, article_inline, sidebar) แสดงตามปกติ
 */
export function useBannerOrchestrator(params: { routeType: string; articleId?: number | null; topicKey?: string | null }) {
  const { data, ...rest } = useResolvedBanners(params)

  const orchestrated = computed<ResolvedBannerMap>(() => {
    const raw = data.value || emptyResolvedBanners()
    const hasPopup = Boolean(raw.popup)
    const hasAnnouncement = Boolean(raw.announcement_bar)

    return {
      ...raw,
      // popup + floating mutex (popup wins)
      floating: hasPopup ? null : raw.floating,
      // ถ้ามี announcement bar แล้ว footer_strip จะถูกซ่อน (sitewide promo overload)
      footer_strip: hasAnnouncement ? null : raw.footer_strip,
    }
  })

  return { data: orchestrated, ...rest }
}
