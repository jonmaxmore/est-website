import { z } from 'zod'

import { parseAdminConfigWrite } from '../../utils/admin-config'

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

  let configInput: ReturnType<typeof parseAdminConfigWrite>

  try {
    configInput = parseAdminConfigWrite(parsed.data)
  } catch (error) {
    throw createError({ statusCode: 400, message: (error as Error).message })
  }

  const config = await prisma.siteConfig.upsert({
    where: { key: configInput.key },
    update: { value: configInput.value as object },
    create: { key: configInput.key, value: configInput.value as object },
  })

  await logActivity(event, 'UPDATE', 'config', `Updated config: ${configInput.key}`, configInput.key)

  return config
})

