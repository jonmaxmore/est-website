/**
 * ═══ Locale-aware field picker + date formatter ═══
 *
 * The CMS stores bilingual records as `xxxEn` + `xxxTh` columns. This
 * composable returns a small helper trio for picking the right one for
 * the current i18n locale, with English as the universal fallback.
 *
 * Usage:
 *   const { localized, localizedDate, locale } = useLocalizedField()
 *   <h1>{{ localized(article.titleEn, article.titleTh) }}</h1>
 *   <time>{{ localizedDate(article.publishedAt, { dateStyle: 'long' }) }}</time>
 */
export function useLocalizedField() {
  const { locale } = useI18n()

  const localized = (en?: string | null, th?: string | null): string => {
    if (locale.value === 'th') return th || en || ''
    return en || th || ''
  }

  const dateLocaleTag = computed(() => (locale.value === 'th' ? 'th-TH' : 'en-US'))

  const localizedDate = (
    value: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
  ): string => {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString(dateLocaleTag.value, options)
  }

  return { locale, localized, localizedDate, dateLocaleTag }
}
