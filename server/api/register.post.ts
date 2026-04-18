import { z } from 'zod'

const REGISTRATION_LIMIT_PER_HOUR = 5

const registerSchema = z.object({
  email: z.string().email(),
  platform: z.enum(['IOS', 'ANDROID', 'PC']),
  region: z.enum(['TH', 'SEA', 'GLOBAL']),
  referredBy: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  // Rate limit
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(
    `reg:${ip}`,
    REGISTRATION_LIMIT_PER_HOUR,
    3600,
  )

  if (!allowed) {
    throw createError({ statusCode: 429, message: 'Too many registrations. Please try later.' })
  }

  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid registration data',
      data: parsed.error.flatten(),
    })
  }

  const { email, platform, region, referredBy } = parsed.data

  // Check duplicate
  const existing = await prisma.preRegistration.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Email already registered' })
  }

  // Generate referral code
  const referralCode = `ETS-${Date.now().toString(36).toUpperCase()}`

  // Parse UTM params
  const query = getQuery(event)

  const registration = await prisma.preRegistration.create({
    data: {
      email,
      platform,
      region,
      referralCode,
      referredBy: referredBy || null,
      ipAddress: ip,
      userAgent: getRequestHeader(event, 'user-agent') || null,
      utmSource: (query.utm_source as string) || null,
      utmMedium: (query.utm_medium as string) || null,
      utmCampaign: (query.utm_campaign as string) || null,
    },
  })

  return {
    success: true,
    referralCode: registration.referralCode,
  }
})
