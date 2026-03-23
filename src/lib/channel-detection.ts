/* ═══════════════════════════════════════════════
   Channel Detection — Derive traffic channel from referrer + UTM
   Matches GA4 Default Channel Grouping logic
   ═══════════════════════════════════════════════ */

const SEARCH_ENGINES = [
  'google', 'bing', 'yahoo', 'baidu', 'duckduckgo', 'yandex',
  'ecosia', 'ask', 'aol', 'naver', 'daum', 'sogou',
]

const SOCIAL_DOMAINS = [
  'facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 'x.com',
  't.co', 'linkedin.com', 'tiktok.com', 'youtube.com', 'youtu.be',
  'reddit.com', 'pinterest.com', 'tumblr.com', 'snapchat.com',
  'threads.net', 'line.me', 'pantip.com',
]

export type TrafficChannel =
  | 'direct' | 'organic' | 'social' | 'referral'
  | 'paid_search' | 'paid_social' | 'email' | 'display' | 'other'

export function deriveChannel(
  referrer: string,
  utmSource?: string,
  utmMedium?: string,
): TrafficChannel {
  const medium = (utmMedium || '').toLowerCase()
  const source = (utmSource || '').toLowerCase()

  // UTM-based classification (highest priority)
  if (medium === 'cpc' || medium === 'ppc' || medium === 'paidsearch') {
    return 'paid_search'
  }
  if (medium === 'paid_social' || medium === 'paidsocial') {
    return 'paid_social'
  }
  if (medium === 'display' || medium === 'banner' || medium === 'cpm') {
    return 'display'
  }
  if (medium === 'email' || source === 'email' || source === 'newsletter') {
    return 'email'
  }
  if (medium === 'social' || medium === 'social-network' || medium === 'social-media') {
    return 'social'
  }
  if (medium === 'organic') {
    return 'organic'
  }
  if (medium === 'referral') {
    return 'referral'
  }

  // Referrer-based classification
  if (!referrer) return 'direct'

  let refHost = ''
  try {
    refHost = new URL(referrer).hostname.toLowerCase()
  } catch {
    return 'direct'
  }

  // Check search engines
  if (SEARCH_ENGINES.some(engine => refHost.includes(engine))) {
    return 'organic'
  }

  // Check social networks
  if (SOCIAL_DOMAINS.some(domain => refHost.includes(domain))) {
    return 'social'
  }

  // Has referrer but not search/social = referral
  if (refHost) return 'referral'

  return 'direct'
}

/** Extract domain from referrer URL for rollup grouping */
export function getReferrerDomain(referrer: string): string {
  if (!referrer) return '(direct)'
  try {
    return new URL(referrer).hostname
  } catch {
    return '(unknown)'
  }
}
