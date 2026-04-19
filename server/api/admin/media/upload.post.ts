import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4']

/** Admin — upload a media file */
export default defineEventHandler(async (event) => {
  // Ensure upload directory exists
  await mkdir(UPLOAD_DIR, { recursive: true })

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  const results = []

  for (const part of formData) {
    if (!part.filename || !part.type) continue

    // Validate file type
    if (!ALLOWED_TYPES.includes(part.type)) {
      throw createError({ statusCode: 400, message: `Unsupported file type: ${part.type}` })
    }

    // Validate file size
    if (part.data.length > MAX_FILE_SIZE) {
      throw createError({ statusCode: 400, message: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB` })
    }

    // Generate unique filename
    const ext = extname(part.filename).toLowerCase() || '.bin'
    const filename = `${randomUUID()}${ext}`
    const filePath = join(UPLOAD_DIR, filename)

    // Write file to disk
    await writeFile(filePath, part.data)

    // Get image dimensions if applicable
    let width: number | null = null
    let height: number | null = null

    if (part.type.startsWith('image/')) {
      try {
        const sharp = (await import('sharp')).default
        const metadata = await sharp(part.data).metadata()
        width = metadata.width || null
        height = metadata.height || null
      } catch {
        // Non-critical: skip if sharp fails
      }
    }

    // Create DB record
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName: part.filename,
        mimeType: part.type,
        sizeBytes: part.data.length,
        width,
        height,
        url: `/uploads/${filename}`,
      },
    })

    results.push(asset)
  }

  await logActivity(event, 'CREATE', 'media', `Uploaded ${results.length} file(s)`)
  return results
})
