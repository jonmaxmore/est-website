import { z } from 'zod'

const configSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
})

/** Upsert a site config entry */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = configSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Validation error', data: parsed.error.flatten() })
  }

  const { key, value } = parsed.data

  const config = await prisma.siteConfig.upsert({
    where: { key },
    update: { value: value as object },
    create: { key, value: value as object },
  })

  return config
})
