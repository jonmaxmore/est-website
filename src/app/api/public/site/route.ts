import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

type UploadValue = { url?: string; alt?: string; mimeType?: string } | null | undefined
type CmsRecord = Record<string, unknown>

function asRecord(value: unknown) {
  return typeof value === 'object' && value ? (value as CmsRecord) : {}
}

function asUpload(value: unknown) {
  if (typeof value === 'object' && value && 'url' in (value as Record<string, unknown>)) {
    const upload = value as UploadValue
    return upload?.url
      ? {
          url: upload.url,
          alt: upload.alt,
          mimeType: upload.mimeType,
        }
      : null
  }
  return null
}

function asUrlOnly(value: unknown) {
  const upload = asUpload(value)
  return upload?.url ? { url: upload.url } : null
}

function asArray<T extends Record<string, unknown>>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : []
}

function mapNavigationLinks(siteSettings: CmsRecord) {
  return asArray<CmsRecord>(siteSettings.navigationLinks)
    .filter((item) => item.visible !== false && typeof item.href === 'string')
    .map((item, index) => ({
      id: String(item.sectionId || index),
      labelEn: (item.labelEn as string) || (item.labelTh as string) || 'Link',
      labelTh: (item.labelTh as string) || (item.labelEn as string) || 'ลิงก์',
      href: (item.href as string) || '/',
      sectionId: (item.sectionId as string) || null,
      openInNewTab: Boolean(item.openInNewTab),
      visible: item.visible !== false,
    }))
}

function mapFooter(siteSettings: CmsRecord) {
  const footer = asRecord(siteSettings.footer)
  return {
    copyrightText: footer.copyrightText as string,
    termsUrl: footer.termsUrl as string,
    privacyUrl: footer.privacyUrl as string,
    supportUrl: footer.supportUrl as string,
    brandCopyEn: footer.brandCopyEn as string,
    brandCopyTh: footer.brandCopyTh as string,
    platformsLabelEn: footer.platformsLabelEn as string,
    platformsLabelTh: footer.platformsLabelTh as string,
    groups: asArray<CmsRecord>(footer.groups).map((group) => ({
      titleEn: (group.titleEn as string) || '',
      titleTh: (group.titleTh as string) || '',
      descriptionEn: (group.descriptionEn as string) || null,
      descriptionTh: (group.descriptionTh as string) || null,
      links: asArray<CmsRecord>(group.links)
        .filter((link) => typeof link.href === 'string')
        .map((link) => ({
          labelEn: (link.labelEn as string) || '',
          labelTh: (link.labelTh as string) || '',
          href: (link.href as string) || '/',
          openInNewTab: Boolean(link.openInNewTab),
        })),
    })).filter((group) => group.links.length > 0),
  }
}

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const siteSettings = await payload.findGlobal({ slug: 'site-settings', depth: 2 })
    
    if (!siteSettings) {
      return NextResponse.json({ error: 'Site settings not found' }, { status: 404 })
    }

    const record = asRecord(siteSettings)
    const response = {
      name: record.siteName,
      description: record.siteDescription,
      logo: asUpload(record.logo),
      registrationUrl: record.registrationUrl,
      navigationLinks: mapNavigationLinks(record),
      socialLinks: record.socialLinks,
      analytics: record.analytics,
      seo: {
        keywords: asRecord(record.seo).keywords,
        ogImage: asUrlOnly(asRecord(record.seo).ogImage),
      },
      footer: mapFooter(record),
    }

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Site Settings API error:', error)
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 })
  }
}
