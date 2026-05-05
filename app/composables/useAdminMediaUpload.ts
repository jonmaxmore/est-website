/**
 * ═══ Media Upload Composable (Client-side) ═══
 * ใช้ในหน้า admin สำหรับ upload ไฟล์รูปภาพ/วิดีโอ
 *
 * ทำไมใช้ XMLHttpRequest แทน fetch:
 * - XHR รองรับ upload progress event (แสดง % การ upload)
 * - fetch API ยังไม่รองรับ upload progress เต็มตัว
 */
import {
  MAX_MEDIA_UPLOAD_BYTES,
  buildMediaUploadError,
  isAllowedMediaUpload,
} from '../shared/cms/media'

type UploadError = ReturnType<typeof buildMediaUploadError>
type UploadResult = { id: string; url: string; filename: string; mimeType: string; sizeBytes: number }

function normalizeUploadError(responseText: string, statusCode: number): UploadError {
  try {
    const parsed = JSON.parse(responseText)
    return parsed?.data ?? parsed
  } catch {
    return buildMediaUploadError('UPLOAD_WRITE_FAILED', `Upload failed (${statusCode})`, 'file')
  }
}

function parseUploadResponse(responseText: string): UploadResult | UploadError {
  try {
    const parsed = JSON.parse(responseText)
    return Array.isArray(parsed) ? parsed[0] : parsed
  } catch {
    return buildMediaUploadError('UPLOAD_WRITE_FAILED', 'Server returned invalid response', 'file')
  }
}

export function useAdminMediaUpload() {
  function validateFile(file: File) {
    if (!isAllowedMediaUpload(file.name, file.type)) {
      return buildMediaUploadError(
        'UNSUPPORTED_TYPE',
        `Unsupported file type for "${file.name}". Allowed: PNG, JPG, WebP, AVIF, GIF, MP4`,
        'file',
      )
    }

    if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
      return buildMediaUploadError(
        'FILE_TOO_LARGE',
        `File too large. Max 100MB (${file.name})`,
        'file',
      )
    }

    return null
  }

  function uploadFile(file: File, onProgress?: (percent: number) => void) {
    const validationError = validateFile(file)
    if (validationError) {
      const failed: Promise<UploadResult> = Promise.reject(validationError)
      // attach a no-op abort so callers can use a uniform shape
      return Object.assign(failed, { abort: () => {} })
    }

    const formData = new FormData()
    formData.append('file', file)
    const xhr = new XMLHttpRequest()
    xhr.timeout = 120_000

    const promise = new Promise<UploadResult>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const parsed = parseUploadResponse(xhr.responseText)
          if ('code' in parsed) {
            reject(parsed)
            return
          }
          resolve(parsed)
          return
        }
        reject(normalizeUploadError(xhr.responseText, xhr.status))
      })

      xhr.addEventListener('error', () => {
        reject(buildMediaUploadError('UPLOAD_WRITE_FAILED', 'Network error during upload', 'file'))
      })

      xhr.addEventListener('timeout', () => {
        reject(buildMediaUploadError('UPLOAD_WRITE_FAILED', 'Upload timed out after 2 minutes', 'file'))
      })

      xhr.addEventListener('abort', () => {
        reject(buildMediaUploadError('UPLOAD_WRITE_FAILED', 'Upload aborted', 'file'))
      })

      xhr.open('POST', '/api/admin/media/upload')
      xhr.withCredentials = true
      xhr.send(formData)
    })

    // Expose abort() so callers can cancel on unmount or user action
    return Object.assign(promise, { abort: () => xhr.abort() })
  }

  return {
    uploadFile,
    validateFile,
  }
}
