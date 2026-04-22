import {
  MAX_MEDIA_UPLOAD_BYTES,
  buildMediaUploadError,
  isAllowedMediaUpload,
} from '../shared/cms/media'

type UploadError = ReturnType<typeof buildMediaUploadError>

function normalizeUploadError(responseText: string, statusCode: number): UploadError {
  try {
    const parsed = JSON.parse(responseText)
    return parsed?.data ?? parsed
  } catch {
    return buildMediaUploadError('UPLOAD_WRITE_FAILED', `Upload failed (${statusCode})`, 'file')
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
        `File too large. Max 10MB (${file.name})`,
        'file',
      )
    }

    return null
  }

  async function uploadFile(file: File, onProgress?: (percent: number) => void) {
    const validationError = validateFile(file)
    if (validationError) {
      throw validationError
    }

    const formData = new FormData()
    formData.append('file', file)

    return await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const parsed = JSON.parse(xhr.responseText)
          resolve(Array.isArray(parsed) ? parsed[0] : parsed)
          return
        }

        reject(normalizeUploadError(xhr.responseText, xhr.status))
      })

      xhr.addEventListener('error', () => {
        reject(buildMediaUploadError('UPLOAD_WRITE_FAILED', 'Network error during upload', 'file'))
      })

      xhr.open('POST', '/api/admin/media/upload')
      xhr.withCredentials = true
      xhr.send(formData)
    })
  }

  return {
    uploadFile,
    validateFile,
  }
}
