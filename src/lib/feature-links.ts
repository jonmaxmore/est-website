type FeatureLinkFieldsInput = {
  href?: unknown;
  ctaLabelEn?: unknown;
  ctaLabelTh?: unknown;
}

const INTERNAL_CMS_HOSTS = new Set(['127.0.0.1', '178.128.127.161', 'localhost'])

function asOptionalString(value: unknown) {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export function looksLikeHref(value: unknown) {
  const href = asOptionalString(value)
  if (!href) return false

  return href.startsWith('/')
    || href.startsWith('#')
    || href.startsWith('mailto:')
    || href.startsWith('tel:')
    || /^https?:\/\//i.test(href)
}

function normalizeHrefValue(value: string | null) {
  if (!value || !/^https?:\/\//i.test(value)) {
    return value
  }

  try {
    const parsed = new URL(value)
    if (!INTERNAL_CMS_HOSTS.has(parsed.hostname)) {
      return value
    }

    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`
    return path || '/'
  } catch {
    return value
  }
}

export function normalizeFeatureLinkFields(fields: FeatureLinkFieldsInput) {
  let href = normalizeHrefValue(asOptionalString(fields.href))
  let ctaLabelEn = asOptionalString(fields.ctaLabelEn)
  let ctaLabelTh = asOptionalString(fields.ctaLabelTh)

  if (!href && looksLikeHref(ctaLabelEn)) {
    href = normalizeHrefValue(ctaLabelEn)
    ctaLabelEn = null
  }

  if (!href && looksLikeHref(ctaLabelTh)) {
    href = normalizeHrefValue(ctaLabelTh)
    ctaLabelTh = null
  }

  if (looksLikeHref(ctaLabelEn)) {
    ctaLabelEn = null
  }

  if (looksLikeHref(ctaLabelTh)) {
    ctaLabelTh = null
  }

  return {
    href,
    ctaLabelEn,
    ctaLabelTh,
  }
}
