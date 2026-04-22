export const MAX_MEDIA_UPLOAD_BYTES = 10 * 1024 * 1024

export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
] as const

export const ALLOWED_MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.mp4'] as const

export type MediaUploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_TYPE'
  | 'NO_FILE'
  | 'UPLOAD_WRITE_FAILED'
  | 'INVALID_METADATA'

export function isAllowedMediaMimeType(mimeType: string) {
  return (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mimeType)
}

export function buildMediaUploadError(code: MediaUploadErrorCode, message: string, field?: string) {
  return field ? { code, message, field } : { code, message }
}
