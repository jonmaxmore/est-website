import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import { extname, join } from 'path'

import {
  MAX_MEDIA_UPLOAD_BYTES,
  buildMediaUploadError,
  isAllowedMediaUpload,
} from '../../../../app/shared/cms/media'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

/** Admin - upload a media file */
export default defineEventHandler(async (event) => {
  await mkdir(UPLOAD_DIR, { recursive: true })

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No file provided',
      data: buildMediaUploadError('NO_FILE', 'No file provided', 'file'),
    })
  }

  const results = []

  for (const part of formData) {
    if (!part.filename) {
      continue
    }

    const detectedType = part.type || extname(part.filename).toLowerCase() || 'unknown'

    if (!isAllowedMediaUpload(part.filename, part.type)) {
      throw createError({
        statusCode: 400,
        message: `Unsupported file type: ${detectedType}`,
        data: buildMediaUploadError('UNSUPPORTED_TYPE', `Unsupported file type: ${detectedType}`, 'file'),
      })
    }

    if (part.data.length > MAX_MEDIA_UPLOAD_BYTES) {
      throw createError({
        statusCode: 400,
        message: 'File too large. Max 10MB',
        data: buildMediaUploadError('FILE_TOO_LARGE', 'File too large. Max 10MB', 'file'),
      })
    }

    const ext = extname(part.filename).toLowerCase() || '.bin'
    const filename = `${randomUUID()}${ext}`
    const filePath = join(UPLOAD_DIR, filename)

    await writeFile(filePath, part.data)

    let width: number | null = null
    let height: number | null = null

    if (part.type?.startsWith('image/')) {
      try {
        const sharpModule = await import('sharp').catch(() => null)
        if (sharpModule?.default) {
          const metadata = await sharpModule.default(part.data).metadata()
          width = metadata.width || null
          height = metadata.height || null
        }
      } catch {
        // Skip dimension extraction when sharp is unavailable.
      }
    }

    try {
      const asset = await prisma.mediaAsset.create({
        data: {
          filename,
          originalName: part.filename,
          mimeType: part.type || 'application/octet-stream',
          sizeBytes: part.data.length,
          width,
          height,
          url: `/uploads/${filename}`,
        },
      })

      results.push(asset)
    } catch (error) {
      try {
        await unlink(filePath)
      } catch {
        // Ignore cleanup failures and surface the original error.
      }

      throw error
    }
  }

  if (results.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No file provided',
      data: buildMediaUploadError('NO_FILE', 'No file provided', 'file'),
    })
  }

  await logActivity(event, 'CREATE', 'media', `Uploaded ${results.length} file(s)`)
  return results
})
