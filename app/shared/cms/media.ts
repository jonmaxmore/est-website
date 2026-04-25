/**
 * ═══ Media Upload Constants & Validators ═══
 * ใช้ร่วมกันทั้ง client (ตรวจสอบก่อน upload) และ server (ตรวจสอบหลังรับ)
 * ไฟล์นี้อยู่ใน shared/ เพื่อให้ทั้ง 2 ฝั่งใช้ logic เดียวกัน
 */

// ขนาดไฟล์สูงสุด 100MB (ต้องตรงกับ Nginx client_max_body_size 110M)
export const MAX_MEDIA_UPLOAD_BYTES = 100 * 1024 * 1024

// ประเภทไฟล์ที่อนุญาต: รูปภาพ (JPEG, PNG, WebP, AVIF, GIF) + วิดีโอ (MP4)
export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
] as const

export const ALLOWED_MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.mp4'] as const
export const MEDIA_PICKER_ACCEPT_VALUES = ['image', 'video', 'all'] as const

export type MediaPickerAccept = (typeof MEDIA_PICKER_ACCEPT_VALUES)[number]
export type MediaAssetKind = 'image' | 'video'

export type MediaUploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_TYPE'
  | 'NO_FILE'
  | 'UPLOAD_WRITE_FAILED'
  | 'INVALID_METADATA'

export function getMediaAssetKind(mimeType: string): MediaAssetKind {
  return mimeType.startsWith('video/') ? 'video' : 'image'
}

export function matchesMediaPickerAccept(mimeType: string, accept: MediaPickerAccept = 'image') {
  if (accept === 'all') {
    return true
  }

  return getMediaAssetKind(mimeType) === accept
}

export function resolveMediaInputAccept(accept: MediaPickerAccept = 'image') {
  if (accept === 'all') {
    return 'image/*,video/*'
  }

  return accept === 'video' ? 'video/*' : 'image/*'
}

export function isAllowedMediaMimeType(mimeType: string) {
  return (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(mimeType)
}

export function isAllowedMediaExtension(fileName: string) {
  const parts = fileName.toLowerCase().split('.')
  if (parts.length < 2) {
    return false
  }

  return (ALLOWED_MEDIA_EXTENSIONS as readonly string[]).includes(`.${parts[parts.length - 1]}`)
}

export function isAllowedMediaUpload(fileName: string, mimeType?: string | null) {
  if (mimeType && isAllowedMediaMimeType(mimeType)) {
    return true
  }

  return isAllowedMediaExtension(fileName)
}

export function buildMediaUploadError(code: MediaUploadErrorCode, message: string, field?: string) {
  return field ? { code, message, field } : { code, message }
}
