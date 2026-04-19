/** Admin — delete a media asset */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw createError({ statusCode: 404, message: 'Asset not found' })

  // Delete file from disk
  try {
    const { unlink } = await import('fs/promises')
    const { join } = await import('path')
    const filePath = join(process.cwd(), 'public', 'uploads', asset.filename)
    await unlink(filePath)
  } catch {
    // File may already be deleted, continue
  }

  await prisma.mediaAsset.delete({ where: { id } })
  await logActivity(event, 'DELETE', 'media', `Deleted media: ${asset.originalName}`, id)
  return { success: true }
})
