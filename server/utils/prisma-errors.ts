import { createError } from 'h3'

type PrismaLikeError = {
  code?: string
  meta?: {
    target?: string[] | string
  }
}

function getDuplicateFields(error: PrismaLikeError) {
  const target = error.meta?.target
  if (Array.isArray(target)) return target.filter(Boolean)
  if (typeof target === 'string' && target.length > 0) return [target]
  return []
}

export function toDuplicateConflictError(
  error: PrismaLikeError,
  options: { resource: string },
) {
  if (error?.code !== 'P2002') return null

  const fields = getDuplicateFields(error)
  const duplicateSuffix = fields.length > 0 ? ` (duplicate ${fields.join(', ')})` : ''

  return createError({
    statusCode: 409,
    statusMessage: 'Conflict',
    message: `${options.resource} already exists${duplicateSuffix}`,
    data: fields.length > 0 ? { fields } : undefined,
  })
}
