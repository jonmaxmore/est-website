/**
 * ═══ UTM Parser ═══
 * Extract utm_source / utm_medium / utm_campaign from a request URL or query
 * object. Each field is trimmed and capped at 64 chars to prevent log
 * pollution from oversized attacker-controlled values.
 *
 * Audit-2 (C-3 + M-2): the columns were missing from page_views /
 * conversion_events so paid-channel attribution was impossible. The
 * 20260506100000_restore_utm_columns migration adds them back; this util
 * is the single source of truth for how the values get extracted +
 * normalized before insert.
 */
const MAX_UTM_LENGTH = 64

export type UtmTags = {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

function clean(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  return trimmed.slice(0, MAX_UTM_LENGTH)
}

export function extractUtmFromQuery(query: Record<string, unknown> | undefined | null): UtmTags {
  if (!query || typeof query !== 'object') {
    return { utmSource: null, utmMedium: null, utmCampaign: null }
  }
  return {
    utmSource: clean(query.utm_source),
    utmMedium: clean(query.utm_medium),
    utmCampaign: clean(query.utm_campaign),
  }
}

export function extractUtmFromUrl(url: string | URL): UtmTags {
  try {
    const parsed = typeof url === 'string' ? new URL(url, 'http://localhost') : url
    const params = parsed.searchParams
    return {
      utmSource: clean(params.get('utm_source')),
      utmMedium: clean(params.get('utm_medium')),
      utmCampaign: clean(params.get('utm_campaign')),
    }
  } catch {
    return { utmSource: null, utmMedium: null, utmCampaign: null }
  }
}
