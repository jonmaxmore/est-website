import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    // Fetch all global settings in parallel
    const [siteSettings, eventConfig, heroSection] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings' }),
      payload.findGlobal({ slug: 'event-config' }),
      payload.findGlobal({ slug: 'hero-section' }),
    ])

    // Fetch store buttons
    const storeButtons = await payload.find({
      collection: 'store-buttons',
      where: { visible: { equals: true } },
      sort: 'sortOrder',
    })

    return NextResponse.json({
      site: {
        name: siteSettings.siteName,
        description: siteSettings.siteDescription,
        logo: typeof siteSettings.logo === 'object' && siteSettings.logo ? {
          url: siteSettings.logo.url,
          alt: siteSettings.logo.alt,
        } : null,
        socialLinks: siteSettings.socialLinks,
        analytics: siteSettings.analytics,
        seo: {
          keywords: siteSettings.seo?.keywords,
          ogImage: typeof siteSettings.seo?.ogImage === 'object' && siteSettings.seo?.ogImage ? {
            url: siteSettings.seo.ogImage.url,
          } : null,
        },
        footer: siteSettings.footer,
      },
      event: {
        enabled: eventConfig.enabled,
        titleEn: eventConfig.titleEn,
        titleTh: eventConfig.titleTh,
        descriptionEn: eventConfig.descriptionEn,
        descriptionTh: eventConfig.descriptionTh,
        countdownTarget: eventConfig.countdownTarget,
        registrationOpen: eventConfig.registrationOpen,
        badgeTextEn: eventConfig.badgeTextEn,
        badgeTextTh: eventConfig.badgeTextTh,
        milestoneBadgeEn: eventConfig.milestoneBadgeEn,
        milestoneBadgeTh: eventConfig.milestoneBadgeTh,
        milestoneTitleEn: eventConfig.milestoneTitleEn,
        milestoneTitleTh: eventConfig.milestoneTitleTh,
        footerText: eventConfig.footerText,
        ctaButtonEn: eventConfig.ctaButtonEn,
        ctaButtonTh: eventConfig.ctaButtonTh,
        modalTitleEn: eventConfig.modalTitleEn,
        modalTitleTh: eventConfig.modalTitleTh,
        emailPlaceholderEn: eventConfig.emailPlaceholderEn,
        emailPlaceholderTh: eventConfig.emailPlaceholderTh,
        storeLabelEn: eventConfig.storeLabelEn,
        storeLabelTh: eventConfig.storeLabelTh,
        submitButtonEn: eventConfig.submitButtonEn,
        submitButtonTh: eventConfig.submitButtonTh,
        successTitleEn: eventConfig.successTitleEn,
        successTitleTh: eventConfig.successTitleTh,
        heroImage: typeof eventConfig.heroImage === 'object' && eventConfig.heroImage ? {
          url: eventConfig.heroImage.url,
        } : null,
        backgroundImage: typeof eventConfig.backgroundImage === 'object' && eventConfig.backgroundImage ? {
          url: eventConfig.backgroundImage.url,
        } : null,
        contentSections: (eventConfig.contentSections as Array<Record<string, unknown>>)?.map((s) => ({
          contentType: s.contentType,
          textEn: s.textEn,
          textTh: s.textTh,
          image: typeof s.image === 'object' && s.image ? { url: (s.image as Record<string, string>).url } : null,
        })) || [],
      },
      hero: {
        taglineEn: heroSection.taglineEn,
        taglineTh: heroSection.taglineTh,
        taglineImageEn: typeof heroSection.taglineImageEn === 'object' && heroSection.taglineImageEn ? {
          url: heroSection.taglineImageEn.url,
        } : null,
        taglineImageTh: typeof heroSection.taglineImageTh === 'object' && heroSection.taglineImageTh ? {
          url: heroSection.taglineImageTh.url,
        } : null,
        ctaTextEn: heroSection.ctaTextEn,
        ctaTextTh: heroSection.ctaTextTh,
        ctaLink: heroSection.ctaLink,
        backgroundVideo: typeof heroSection.backgroundVideo === 'object' && heroSection.backgroundVideo ? {
          url: heroSection.backgroundVideo.url,
        } : null,
        backgroundImage: typeof heroSection.backgroundImage === 'object' && heroSection.backgroundImage ? {
          url: heroSection.backgroundImage.url,
        } : null,

        features: heroSection.features?.map((f: Record<string, string>) => ({
          icon: f.icon,
          titleEn: f.titleEn,
          titleTh: f.titleTh,
          descriptionEn: f.descriptionEn,
          descriptionTh: f.descriptionTh,
        })) || [],
      },
      characters: {
        bgImage: typeof heroSection.charactersBgImage === 'object' && heroSection.charactersBgImage ? {
          url: (heroSection.charactersBgImage as { url: string }).url,
        } : null,
        badgeEn: heroSection.charactersBadgeEn || 'CHOOSE YOUR HERO',
        badgeTh: heroSection.charactersBadgeTh || 'เลือกฮีโร่ของคุณ',
        titleEn: heroSection.charactersTitleEn || 'Heroes of Arcatea',
        titleTh: heroSection.charactersTitleTh || 'ฮีโร่แห่ง Arcatea',
        voiceButtonEn: heroSection.voiceButtonEn || 'Listen to Voice Line',
        voiceButtonTh: heroSection.voiceButtonTh || 'ฟังเสียงตัวละคร',
      },
      highlights: {
        badgeEn: heroSection.highlightsBadgeEn || 'GAME FEATURES',
        badgeTh: heroSection.highlightsBadgeTh || 'ฟีเจอร์เกม',
        titleEn: heroSection.highlightsTitleEn || 'Game Highlights',
        titleTh: heroSection.highlightsTitleTh || 'ไฮไลท์เกม',
        bgImage: typeof heroSection.highlightsBgImage === 'object' && heroSection.highlightsBgImage ? {
          url: (heroSection.highlightsBgImage as { url: string }).url,
        } : null,
      },
      news: {
        badgeEn: heroSection.newsBadgeEn || 'LATEST NEWS',
        badgeTh: heroSection.newsBadgeTh || 'ข่าวล่าสุด',
        titleEn: heroSection.newsTitleEn || 'News & Updates',
        titleTh: heroSection.newsTitleTh || 'ข่าวสารและอัพเดท',
      },
      storyPage: {
        heroImage: typeof heroSection.storyPageHeroImage === 'object' && heroSection.storyPageHeroImage ? {
          url: (heroSection.storyPageHeroImage as { url: string }).url,
        } : null,
        badgeEn: heroSection.storyPageBadgeEn || 'LORE',
        badgeTh: heroSection.storyPageBadgeTh || 'เนื้อเรื่อง',
        titleEn: heroSection.storyPageTitleEn || 'Story',
        titleTh: heroSection.storyPageTitleTh || 'เนื้อเรื่อง',
        subtitleEn: heroSection.storyPageSubtitleEn || 'The tale of Arcatéa and The Boundless Spire',
        subtitleTh: heroSection.storyPageSubtitleTh || 'เรื่องราวแห่งดินแดน Arcatéa และหอคอยไร้ขอบเขต',
        sections: (heroSection.storySections as Array<Record<string, string>>)?.map((s) => ({
          titleEn: s.titleEn,
          titleTh: s.titleTh,
          contentEn: s.contentEn,
          contentTh: s.contentTh,
        })) || [],
      },
      gameGuidePage: {
        heroImage: typeof heroSection.gameGuideHeroImage === 'object' && heroSection.gameGuideHeroImage ? {
          url: (heroSection.gameGuideHeroImage as { url: string }).url,
        } : null,
        badgeEn: heroSection.gameGuideBadgeEn || 'GAME GUIDE',
        badgeTh: heroSection.gameGuideBadgeTh || 'แนะนำเกม',
        titleEn: heroSection.gameGuideTitleEn || 'Game Guide',
        titleTh: heroSection.gameGuideTitleTh || 'แนะนำเกม',
        subtitleEn: heroSection.gameGuideSubtitleEn || 'Experience the new era of Eternal Tower Saga',
        subtitleTh: heroSection.gameGuideSubtitleTh || 'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga',
        features: (heroSection.gameGuideFeatures as Array<Record<string, string>>)?.map((f) => ({
          icon: f.icon,
          titleEn: f.titleEn,
          titleTh: f.titleTh,
          descriptionEn: f.descriptionEn,
          descriptionTh: f.descriptionTh,
        })) || [],
      },
      storeButtons: storeButtons.docs.map((btn) => ({
        id: btn.id,
        platform: btn.platform,
        label: btn.label,
        sublabel: btn.sublabel,
        url: btn.url,
        icon: typeof btn.icon === 'object' && btn.icon ? { url: btn.icon.url } : null,
      })),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
