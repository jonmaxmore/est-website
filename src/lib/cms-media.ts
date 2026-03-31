export function isCmsMediaUrl(src: string | null | undefined) {
  return Boolean(src && src.startsWith('/api/media/'));
}
