/**
 * ═══ Media Upload API ═══
 * POST /api/admin/media/upload
 *
 * ขั้นตอน:
 * 1. รับ multipart form data (รองรับหลายไฟล์พร้อมกัน)
 * 2. validate ประเภทไฟล์ + ขนาด (สูงสุด 100MB)
 * 3. เขียนไฟล์ลง disk (ชื่อ UUID ป้องกันชื่อซ้ำ)
 * 4. อ่านขนาดรูปด้วย sharp (ถ้ามี)
 * 5. บันทึกลง DB (MediaAsset)
 *
 * ⚗️ ตั้งค่า Nginx ที่เกี่ยวข้อง: docker/nginx/default.conf
 *    - proxy_request_buffering off (สตรีมไฟล์ตรงไป backend)
 *    - client_max_body_size 110M
 *    - timeout 300s
 */
import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import { extname, join } from 'path'

import {
  MAX_MEDIA_UPLOAD_BYTES,
  buildMediaUploadError,
  isAllowedMediaUpload,
} from '../../../../app/shared/cms/media'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

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
        message: 'File too large. Max 100MB',
        data: buildMediaUploadError('FILE_TOO_LARGE', 'File too large. Max 100MB', 'file'),
      })
    }

    const ext = extname(part.filename).toLowerCase() || '.bin'
    const filename = `${randomUUID()}${ext}`
    const filePath = join(UPLOAD_DIR, filename)

    await writeFile(filePath, part.data)

    let width: number | null = null
    let height: number | null = null

    // อ่านขนาดรูปภาพด้วย sharp (ถ้า sharp ไม่มีก็ข้ามไป — ไม่บังคับ)
    if (part.type?.startsWith('image/')) {
      try {
        const sharpModule = await import('sharp').catch(() => null)
        if (sharpModule?.default) {
          const metadata = await sharpModule.default(part.data).metadata()
          width = metadata.width || null
          height = metadata.height || null
        }
      } catch {
        // sharp ไม่ได้ติดตั้งใน Alpine Linux บางครั้ง — ข้ามไปได้
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
          duration: part.type?.startsWith('video/') ? null : undefined,
          url: `/uploads/${filename}`,
        },
      })

      results.push(asset)
    } catch (error) {
      // ถ้าบันทึก DB พัง → ลบไฟล์ที่เขียนไปแล้วทิ้ง (cleanup)
      try {
        await unlink(filePath)
      } catch {
        // cleanup ล้มเหลวไม่เป็นไร — ส่ง error ต้นทางกลับไป
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
