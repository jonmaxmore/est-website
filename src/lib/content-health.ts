import {
  hasMeaningfulNewsBody,
  isPlaceholderNewsTitle,
  summarizeNewsField,
} from '@/lib/news-content'
import { looksLikeHref } from '@/lib/feature-links'

export type ContentHealthSeverity = 'error' | 'warning'

export type ContentHealthIssue = {
  code: string;
  severity: ContentHealthSeverity;
  message: string;
}

type NewsHealthInput = {
  id?: number | string;
  titleEn?: string | null;
  titleTh?: string | null;
  slug?: string | null;
  status?: string | null;
  publishedAt?: string | null;
  excerptEn?: string | null;
  excerptTh?: string | null;
  contentEn?: unknown;
  contentTh?: unknown;
  featuredImage?: unknown;
}

export type NewsHealthReport = {
  id: number | string | null;
  titleEn: string;
  slug: string;
  status: string;
  issues: ContentHealthIssue[];
}

export type GlobalHealthReport = {
  key: string;
  label: string;
  issues: ContentHealthIssue[];
  metrics: Record<string, number>;
}

export type ContentHealthSummary = {
  publishedNews: number;
  newsWithErrors: number;
  newsWithWarnings: number;
  globalsWithErrors: number;
  globalsWithWarnings: number;
}

export type ContentHealthReport = {
  generatedAt: string;
  summary: ContentHealthSummary;
  news: NewsHealthReport[];
  globals: GlobalHealthReport[];
}

function hasValue(value: unknown) {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value)
}

function appendIssue(
  issues: ContentHealthIssue[],
  code: string,
  severity: ContentHealthSeverity,
  message: string,
) {
  issues.push({ code, severity, message })
}

function addTitleAndSlugIssues(
  issues: ContentHealthIssue[],
  input: {
    article: NewsHealthInput;
    status: string;
    titleEn: string;
    titleTh: string;
    slug: string;
  },
) {
  const { article, status, titleEn, titleTh, slug } = input
  if (!titleEn || isPlaceholderNewsTitle(titleEn)) {
    appendIssue(
      issues,
      'title_en_invalid',
      status === 'published' ? 'error' : 'warning',
      'English title is missing or still looks like placeholder content.',
    )
  }

  if (!titleTh || isPlaceholderNewsTitle(titleTh)) {
    appendIssue(
      issues,
      'title_th_invalid',
      status === 'published' ? 'error' : 'warning',
      'Thai title is missing or still looks like placeholder content.',
    )
  }

  if (!slug) {
    appendIssue(
      issues,
      'slug_missing',
      status === 'published' ? 'error' : 'warning',
      'Slug is missing, so the article does not have a stable frontend path.',
    )
  }

  if (status === 'published' && !article.publishedAt) {
    appendIssue(issues, 'published_at_missing', 'error', 'Published article is missing a publish date.')
  }
}

function addBodyIssues(
  issues: ContentHealthIssue[],
  status: string,
  hasBodyEn: boolean,
  hasBodyTh: boolean,
) {
  if (!hasBodyEn && !hasBodyTh) {
    appendIssue(
      issues,
      'content_missing',
      status === 'published' ? 'error' : 'warning',
      'Neither English nor Thai article body has enough content for the detail page.',
    )
    return
  }

  if (!hasBodyEn) {
    appendIssue(issues, 'content_en_missing', 'warning', 'English body content is missing or too short.')
  }

  if (!hasBodyTh) {
    appendIssue(issues, 'content_th_missing', 'warning', 'Thai body content is missing or too short.')
  }
}

function addSummaryIssues(
  issues: ContentHealthIssue[],
  status: string,
  summaryEn: string | null,
  summaryTh: string | null,
) {
  if (!summaryEn && !summaryTh) {
    appendIssue(
      issues,
      'summary_missing',
      status === 'published' ? 'error' : 'warning',
      'Listing summary is unavailable in both locales.',
    )
    return
  }

  if (!summaryEn) {
    appendIssue(
      issues,
      'summary_en_missing',
      'warning',
      'English summary is unavailable and will fall back from another source.',
    )
  }

  if (!summaryTh) {
    appendIssue(
      issues,
      'summary_th_missing',
      'warning',
      'Thai summary is unavailable and will fall back from another source.',
    )
  }
}

export function evaluateNewsHealth(article: NewsHealthInput): ContentHealthIssue[] {
  const issues: ContentHealthIssue[] = []
  const titleEn = typeof article.titleEn === 'string' ? article.titleEn.trim() : ''
  const titleTh = typeof article.titleTh === 'string' ? article.titleTh.trim() : ''
  const slug = typeof article.slug === 'string' ? article.slug.trim() : ''
  const status = typeof article.status === 'string' ? article.status : 'draft'
  const summaryEn = summarizeNewsField(article.excerptEn, article.contentEn, 180)
  const summaryTh = summarizeNewsField(article.excerptTh, article.contentTh, 180)
  const hasBodyEn = hasMeaningfulNewsBody(article.contentEn)
  const hasBodyTh = hasMeaningfulNewsBody(article.contentTh)

  addTitleAndSlugIssues(issues, { article, status, titleEn, titleTh, slug })
  addBodyIssues(issues, status, hasBodyEn, hasBodyTh)
  addSummaryIssues(issues, status, summaryEn, summaryTh)

  return issues
}

export function buildNewsHealthReport(article: NewsHealthInput): NewsHealthReport {
  return {
    id: article.id ?? null,
    titleEn: typeof article.titleEn === 'string' ? article.titleEn : 'Untitled article',
    slug: typeof article.slug === 'string' ? article.slug : '',
    status: typeof article.status === 'string' ? article.status : 'draft',
    issues: evaluateNewsHealth(article),
  }
}

export function buildSiteSettingsHealthReport(settings: Record<string, unknown> | null | undefined): GlobalHealthReport {
  const navigationLinks = Array.isArray(settings?.navigationLinks)
    ? settings.navigationLinks.filter((item) => item && typeof item === 'object' && (item as { visible?: boolean }).visible !== false)
    : []
  const footerGroups = Array.isArray((settings?.footer as { groups?: unknown[] } | undefined)?.groups)
    ? ((settings?.footer as { groups?: unknown[] }).groups || [])
    : []
  const issues: ContentHealthIssue[] = []

  if (!hasValue(settings?.registrationUrl)) {
    issues.push({
      code: 'registration_url_missing',
      severity: 'error',
      message: 'Primary registration URL is missing from site settings.',
    })
  }

  if (!navigationLinks.length) {
    issues.push({
      code: 'navigation_missing',
      severity: 'error',
      message: 'Visible navigation links are not configured.',
    })
  }

  if (!hasValue(settings?.logo)) {
    issues.push({
      code: 'logo_missing',
      severity: 'warning',
      message: 'Site logo is missing from global settings.',
    })
  }

  if (!footerGroups.length) {
    issues.push({
      code: 'footer_groups_missing',
      severity: 'warning',
      message: 'Footer link groups are missing or empty.',
    })
  }

  if (!hasValue((settings?.footer as { brandCopyEn?: unknown } | undefined)?.brandCopyEn)
    || !hasValue((settings?.footer as { brandCopyTh?: unknown } | undefined)?.brandCopyTh)) {
    issues.push({
      code: 'footer_brand_copy_missing',
      severity: 'warning',
      message: 'Footer brand copy is incomplete.',
    })
  }

  if (!hasValue((settings?.footer as { platformsLabelEn?: unknown } | undefined)?.platformsLabelEn)
    || !hasValue((settings?.footer as { platformsLabelTh?: unknown } | undefined)?.platformsLabelTh)) {
    issues.push({
      code: 'footer_platform_labels_missing',
      severity: 'warning',
      message: 'Footer platform labels are incomplete.',
    })
  }

  return {
    key: 'site-settings',
    label: 'Site Settings',
    issues,
    metrics: {
      navigationLinks: navigationLinks.length,
      footerGroups: footerGroups.length,
    },
  }
}

export function buildHomepageHealthReport(homepage: Record<string, unknown> | null | undefined): GlobalHealthReport {
  const features = Array.isArray(homepage?.features) ? homepage.features : []
  const issues: ContentHealthIssue[] = []
  const hasHeroBackgroundMedia = hasValue(homepage?.backgroundImage) || hasValue(homepage?.backgroundVideo)
  const featuresWithMedia = features.filter((feature) => feature && typeof feature === 'object' && (
    hasValue((feature as { previewImage?: unknown }).previewImage)
      || hasValue((feature as { iconImage?: unknown }).iconImage)
  )).length
  const featuresWithLegacyLinks = features.filter((feature) => feature && typeof feature === 'object' && (
    looksLikeHref((feature as { ctaLabelEn?: unknown }).ctaLabelEn)
      || looksLikeHref((feature as { ctaLabelTh?: unknown }).ctaLabelTh)
  )).length

  if (!hasValue(homepage?.newsTitleEn) || !hasValue(homepage?.newsTitleTh)) {
    issues.push({
      code: 'news_heading_missing',
      severity: 'warning',
      message: 'Homepage news section heading is incomplete.',
    })
  }

  if (!hasHeroBackgroundMedia) {
    issues.push({
      code: 'homepage_hero_media_missing',
      severity: 'warning',
      message: 'Homepage hero does not have CMS background image or background video configured.',
    })
  }

  if (!features.length) {
    issues.push({
      code: 'homepage_features_missing',
      severity: 'warning',
      message: 'Homepage highlights do not have feature items configured.',
    })
  } else if (!featuresWithMedia) {
    issues.push({
      code: 'homepage_feature_media_missing',
      severity: 'warning',
      message: 'Homepage feature items do not have preview media configured yet.',
    })
  }

  if (featuresWithLegacyLinks > 0) {
    issues.push({
      code: 'homepage_feature_links_invalid',
      severity: 'warning',
      message: 'One or more homepage feature CTA labels still contain raw URLs instead of clean labels.',
    })
  }

  return {
    key: 'homepage',
    label: 'Homepage',
    issues,
    metrics: {
      hasHeroBackgroundMedia: hasHeroBackgroundMedia ? 1 : 0,
      highlightFeatures: features.length,
      featuresWithMedia,
      featuresWithLegacyLinks,
    },
  }
}

export function buildGameGuideHealthReport(gameGuide: Record<string, unknown> | null | undefined): GlobalHealthReport {
  const features = Array.isArray(gameGuide?.features) ? gameGuide.features : []
  const issues: ContentHealthIssue[] = []
  const featuresWithMedia = features.filter((feature) => feature && typeof feature === 'object' && (
    hasValue((feature as { previewImage?: unknown }).previewImage)
      || hasValue((feature as { iconImage?: unknown }).iconImage)
  )).length

  if (!hasValue(gameGuide?.titleEn) || !hasValue(gameGuide?.titleTh)) {
    issues.push({
      code: 'game_guide_title_missing',
      severity: 'warning',
      message: 'Game Guide title is incomplete.',
    })
  }

  if (!hasValue(gameGuide?.systemsTitleEn) || !hasValue(gameGuide?.systemsTitleTh)) {
    issues.push({
      code: 'game_guide_systems_title_missing',
      severity: 'warning',
      message: 'Game Guide systems section heading is incomplete.',
    })
  }

  if (!hasValue(gameGuide?.subtitleEn) || !hasValue(gameGuide?.subtitleTh)) {
    issues.push({
      code: 'game_guide_subtitle_missing',
      severity: 'warning',
      message: 'Game Guide hero subtitle is incomplete.',
    })
  }

  if (!hasValue(gameGuide?.heroPanelLabelEn) || !hasValue(gameGuide?.heroPanelLabelTh)
    || !hasValue(gameGuide?.heroPanelCopyEn) || !hasValue(gameGuide?.heroPanelCopyTh)) {
    issues.push({
      code: 'game_guide_hero_panel_missing',
      severity: 'warning',
      message: 'Game Guide hero panel copy is incomplete.',
    })
  }

  if (!hasValue(gameGuide?.systemsBadgeEn) || !hasValue(gameGuide?.systemsBadgeTh)
    || !hasValue(gameGuide?.systemsCopyEn) || !hasValue(gameGuide?.systemsCopyTh)) {
    issues.push({
      code: 'game_guide_systems_copy_missing',
      severity: 'warning',
      message: 'Game Guide systems badge or intro copy is incomplete.',
    })
  }

  const pillarsEn = Array.isArray(gameGuide?.pillarsEn) ? gameGuide.pillarsEn : []
  const pillarsTh = Array.isArray(gameGuide?.pillarsTh) ? gameGuide.pillarsTh : []

  if (!pillarsEn.length || !pillarsTh.length) {
    issues.push({
      code: 'game_guide_pillars_missing',
      severity: 'warning',
      message: 'Game Guide journey pillars are not fully configured.',
    })
  }

  if (!features.length) {
    issues.push({
      code: 'game_guide_features_missing',
      severity: 'warning',
      message: 'Game Guide does not have CMS feature items configured.',
    })
  } else if (!featuresWithMedia) {
    issues.push({
      code: 'game_guide_feature_media_missing',
      severity: 'warning',
      message: 'Game Guide feature cards do not have preview media configured yet.',
    })
  }

  return {
    key: 'game-guide-page',
    label: 'Game Guide',
    issues,
    metrics: {
      features: features.length,
      featuresWithMedia,
    },
  }
}

export function buildNewsPageHealthReport(newsPage: Record<string, unknown> | null | undefined): GlobalHealthReport {
  const issues: ContentHealthIssue[] = []

  if (!hasValue(newsPage?.titleEn) || !hasValue(newsPage?.titleTh)) {
    issues.push({
      code: 'news_page_title_missing',
      severity: 'warning',
      message: 'News page title is incomplete.',
    })
  }

  if (!hasValue(newsPage?.subtitleEn) || !hasValue(newsPage?.subtitleTh)) {
    issues.push({
      code: 'news_page_subtitle_missing',
      severity: 'warning',
      message: 'News page hero subtitle is incomplete.',
    })
  }

  return {
    key: 'news-page',
    label: 'News Page',
    issues,
    metrics: {
      hasBackgroundImage: hasValue(newsPage?.backgroundImage) ? 1 : 0,
      hasArchiveCopy:
        hasValue(newsPage?.archiveKickerEn)
        || hasValue(newsPage?.archiveKickerTh)
        || hasValue(newsPage?.archiveTitleEn)
        || hasValue(newsPage?.archiveTitleTh)
        || hasValue(newsPage?.archiveIntroEn)
        || hasValue(newsPage?.archiveIntroTh)
          ? 1
          : 0,
    },
  }
}

export function buildStoreButtonsHealthReport(storeButtons: Array<Record<string, unknown>>): GlobalHealthReport {
  const visibleButtons = storeButtons.filter((button) => button.visible !== false)
  const brandedButtons = visibleButtons.filter((button) => hasValue(button.icon)).length
  const issues: ContentHealthIssue[] = []

  const missingCoreIcons = visibleButtons.filter((button) => {
    const platform = typeof button.platform === 'string' ? button.platform : ''
    return (platform === 'ios' || platform === 'android') && !hasValue(button.icon)
  })

  if (missingCoreIcons.length > 0) {
    issues.push({
      code: 'store_button_icons_missing',
      severity: 'warning',
      message: 'Core store buttons are missing branded media badges in CMS.',
    })
  }

  return {
    key: 'store-buttons',
    label: 'Store Buttons',
    issues,
    metrics: {
      visibleButtons: visibleButtons.length,
      buttonsWithIcons: brandedButtons,
    },
  }
}

export function buildContentHealthReport(args: {
  news: NewsHealthReport[];
  globals: GlobalHealthReport[];
}): ContentHealthReport {
  const { news, globals } = args

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      publishedNews: news.length,
      newsWithErrors: news.filter((article) => article.issues.some((issue) => issue.severity === 'error')).length,
      newsWithWarnings: news.filter((article) => article.issues.some((issue) => issue.severity === 'warning')).length,
      globalsWithErrors: globals.filter((item) => item.issues.some((issue) => issue.severity === 'error')).length,
      globalsWithWarnings: globals.filter((item) => item.issues.some((issue) => issue.severity === 'warning')).length,
    },
    news,
    globals,
  }
}
