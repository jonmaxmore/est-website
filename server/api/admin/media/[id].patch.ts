import { z } from 'zod'

const mediaMetadataSchema = z.object({
  altText: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null)),
})

/** Admin - update media metadata */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid media asset id' })
  }

  const parsedBody = mediaMetadataSchema.safeParse(await readBody(event))
  if (!parsedBody.success) {
    throw createError({ statusCode: 400, message: 'Invalid media metadata' })
  }

  const body = parsedBody.data
  const existingAsset = await prisma.mediaAsset.findUnique({ where: { id } })

  if (!existingAsset) {
    throw createError({ statusCode: 404, message: 'Asset not found' })
  }

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: { altText: body.altText },
  })

  await logActivity(event, 'UPDATE', 'media', `Updated media metadata: ${asset.originalName}`, asset.id)
  return asset
})
