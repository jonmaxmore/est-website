import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    // Fetch all global settings in parallel
    const [siteSettings, eventConfig, homepage, storyPage, gameGuidePage] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings' }),
      payload.findGlobal({ slug: 'event-config' }),
      payload.findGlobal({ slug: 'homepage' }),
      payload.findGlobal({ slug: 'story-page' }),
      payload.findGlobal({ slug: 'game-guide-page' }),
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
        taglineEn: homepage.taglineEn,
        taglineTh: homepage.taglineTh,
        taglineImageEn: typeof homepage.taglineImageEn === 'object' && homepage.taglineImageEn ? {
          url: homepage.taglineImageEn.url,
        } : null,
        taglineImageTh: typeof homepage.taglineImageTh === 'object' && homepage.taglineImageTh ? {
          url: homepage.taglineImageTh.url,
        } : null,
        ctaTextEn: homepage.ctaTextEn,
        ctaTextTh: homepage.ctaTextTh,
        ctaLink: homepage.ctaLink,
        backgroundVideo: typeof homepage.backgroundVideo === 'object' && homepage.backgroundVideo ? {
          url: homepage.backgroundVideo.url,
        } : null,
        backgroundImage: typeof homepage.backgroundImage === 'object' && homepage.backgroundImage ? {
          url: homepage.backgroundImage.url,
        } : null,

        features: homepage.features?.map((f: Record<string, string>) => ({
          icon: f.icon,
          titleEn: f.titleEn,
          titleTh: f.titleTh,
          descriptionEn: f.descriptionEn,
          descriptionTh: f.descriptionTh,
        })) || [],
      },
      characters: {
        bgImage: typeof homepage.charactersBgImage === 'object' && homepage.charactersBgImage ? {
          url: (homepage.charactersBgImage as { url: string }).url,
        } : null,
        badgeEn: homepage.charactersBadgeEn || 'CHOOSE YOUR HERO',
        badgeTh: homepage.charactersBadgeTh || 'เลือกฮีโร่ของคุณ',
        titleEn: homepage.charactersTitleEn || 'Heroes of Arcatea',
        titleTh: homepage.charactersTitleTh || 'ฮีโร่แห่ง Arcatea',
        voiceButtonEn: homepage.voiceButtonEn || 'Listen to Voice Line',
        voiceButtonTh: homepage.voiceButtonTh || 'ฟังเสียงตัวละคร',
      },
      highlights: {
        badgeEn: homepage.highlightsBadgeEn || 'GAME FEATURES',
        badgeTh: homepage.highlightsBadgeTh || 'ฟีเจอร์เกม',
        titleEn: homepage.highlightsTitleEn || 'Game Highlights',
        titleTh: homepage.highlightsTitleTh || 'ไฮไลท์เกม',
        bgImage: typeof homepage.highlightsBgImage === 'object' && homepage.highlightsBgImage ? {
          url: (homepage.highlightsBgImage as { url: string }).url,
        } : null,
      },
      news: {
        badgeEn: homepage.newsBadgeEn || 'LATEST NEWS',
        badgeTh: homepage.newsBadgeTh || 'ข่าวล่าสุด',
        titleEn: homepage.newsTitleEn || 'News & Updates',
        titleTh: homepage.newsTitleTh || 'ข่าวสารและอัพเดท',
      },
      storyPage: {
        heroImage: typeof storyPage.heroImage === 'object' && storyPage.heroImage ? {
          url: (storyPage.heroImage as { url: string }).url,
        } : null,
        badgeEn: storyPage.badgeEn || 'LORE',
        badgeTh: storyPage.badgeTh || 'เนื้อเรื่อง',
        titleEn: storyPage.titleEn || 'Story',
        titleTh: storyPage.titleTh || 'เนื้อเรื่อง',
        subtitleEn: storyPage.subtitleEn || 'The tale of Arcatéa and The Boundless Spire',
        subtitleTh: storyPage.subtitleTh || 'เรื่องราวแห่งดินแดน Arcatéa และหอคอยไร้ขอบเขต',
        sections: (storyPage.sections as Array<Record<string, string>>)?.map((s) => ({
          titleEn: s.titleEn,
          titleTh: s.titleTh,
          contentEn: s.contentEn,
          contentTh: s.contentTh,
        })) || [],
      },
      gameGuidePage: {
        heroImage: typeof gameGuidePage.heroImage === 'object' && gameGuidePage.heroImage ? {
          url: (gameGuidePage.heroImage as { url: string }).url,
        } : null,
        badgeEn: gameGuidePage.badgeEn || 'GAME GUIDE',
        badgeTh: gameGuidePage.badgeTh || 'แนะนำเกม',
        titleEn: gameGuidePage.titleEn || 'Game Guide',
        titleTh: gameGuidePage.titleTh || 'แนะนำเกม',
        subtitleEn: gameGuidePage.subtitleEn || 'Experience the new era of Eternal Tower Saga',
        subtitleTh: gameGuidePage.subtitleTh || 'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga',
        features: (gameGuidePage.features as Array<Record<string, string>>)?.map((f) => ({
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
