import sanitizeHtml from 'sanitize-html'

export const WEBZINE_CONTENT_TYPES = ['ANNOUNCEMENT', 'EVENT', 'PATCH_NOTES', 'GUIDE', 'LORE', 'DEV_BLOG'] as const

export type WebzineContentType = (typeof WEBZINE_CONTENT_TYPES)[number]

export type WebzineTopic = {
  key: string
  slug: string
  labelEn: string
  labelTh: string
  descriptionEn?: string
  descriptionTh?: string
  icon?: string
  color?: string
  visible: boolean
}

function slugifyTopicValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeWebzineTopics(value: unknown[] | null | undefined) {
  return ((value ?? []) as WebzineTopic[]).map((topic) => {
    const labelEn = topic.labelEn.trim()
    const key = slugifyTopicValue(topic.key || topic.slug || labelEn)
    const slug = slugifyTopicValue(topic.slug || topic.key || labelEn)
    const labelTh = topic.labelTh.trim() || labelEn

    return {
      key,
      slug,
      labelEn,
      labelTh,
      descriptionEn: topic.descriptionEn?.trim() || '',
      descriptionTh: topic.descriptionTh?.trim() || '',
      icon: topic.icon?.trim() || '',
      color: topic.color?.trim() || '',
      visible: Boolean(topic.visible),
    }
  })
}

export function estimateReadingTimeMinutes(html: string | null | undefined) {
  const text = sanitizeHtml(html || '', {
    allowedTags: [],
    allowedAttributes: {},
  })
  const words = text.trim().split(/\s+/).filter(Boolean).length

  return Math.max(1, Math.ceil(words / 200))
}
