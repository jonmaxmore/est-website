const DEFAULT_TIME_ZONE = 'Asia/Bangkok';

export function formatLocalizedDate(
  value: string | number | Date,
  lang: string,
  options: Intl.DateTimeFormatOptions,
) {
  const locale = lang === 'th' ? 'th-TH' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: options.timeZone || DEFAULT_TIME_ZONE,
  }).format(new Date(value));
}
