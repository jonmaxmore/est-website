/**
 * ═══ Uploads Static Handler ═══
 * GET /uploads/{filename}
 *
 * Serves user-uploaded media files from the persistent Docker volume
 * mounted at process.cwd()/public/uploads.
 *
 * Why this exists: Nuxt's built-in public/ handler only serves files that
 * existed at BUILD time (copied to .output/public/). Files uploaded at
 * runtime live in /app/public/uploads (the volume mount) and are
 * invisible to Nitro's default static serving. This route bridges the gap.
 */
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { extname, join, normalize } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
}

export default defineEventHandler(async (event) => {
  const params = getRouterParam(event, 'path')
  if (!params) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  // Defend against path traversal: normalize and ensure result stays inside UPLOAD_DIR
  const safePath = normalize(params).replace(/^(\.\.[/\\])+/, '')
  const filePath = join(UPLOAD_DIR, safePath)
  if (!filePath.startsWith(UPLOAD_DIR)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const stats = await stat(filePath).catch(() => null)
  if (!stats || !stats.isFile()) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const ext = extname(filePath).toLowerCase()
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

  setResponseHeader(event, 'content-type', mimeType)
  setResponseHeader(event, 'content-length', stats.size)
  setResponseHeader(event, 'cache-control', 'public, max-age=31536000, immutable')

  return sendStream(event, createReadStream(filePath))
})
