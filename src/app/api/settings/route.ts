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
      },
      hero: {
        taglineEn: heroSection.taglineEn,
        taglineTh: heroSection.taglineTh,
        ctaTextEn: heroSection.ctaTextEn,
        ctaTextTh: heroSection.ctaTextTh,
        ctaLink: heroSection.ctaLink,
        videoUrl: heroSection.videoUrl,
        backgroundImage: typeof heroSection.backgroundImage === 'object' && heroSection.backgroundImage ? {
          url: heroSection.backgroundImage.url,
        } : null,
        mercenarySection: {
          titleEn: heroSection.mercenarySection?.titleEn,
          titleTh: heroSection.mercenarySection?.titleTh,
          subtitleEn: heroSection.mercenarySection?.subtitleEn,
          subtitleTh: heroSection.mercenarySection?.subtitleTh,
          artImage: typeof heroSection.mercenarySection?.artImage === 'object' && heroSection.mercenarySection?.artImage ? {
            url: heroSection.mercenarySection.artImage.url,
          } : null,
        },
        features: heroSection.features?.map((f: Record<string, string>) => ({
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
