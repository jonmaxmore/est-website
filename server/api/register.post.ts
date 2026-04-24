import { randomBytes } from 'node:crypto'
import { z } from 'zod'

const REGISTRATION_LIMIT_PER_HOUR = 5

const registerSchema = z.object({
  email: z.string().email().max(255, 'Email must be 255 characters or less'),
  platform: z.enum(['IOS', 'ANDROID', 'PC']),
  region: z.enum(['TH', 'SEA', 'GLOBAL']),
  referredBy: z.string().max(50, 'Referral code must be 50 characters or less').optional(),
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

  // Parse and validate body
  let body: unknown
  try {
    body = await readBody(event)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  // Reject empty or non-object payloads
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, message: 'Request body must be a JSON object with required fields: email, platform, region' })
  }

  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid registration data',
      data: parsed.error.flatten(),
    })
  }

  const { email, platform, region, referredBy } = parsed.data

  // Check duplicate email
  const existing = await prisma.preRegistration.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Email already registered' })
  }

  // Validate referral code exists if provided
  if (referredBy) {
    const referrer = await prisma.preRegistration.findUnique({
      where: { referralCode: referredBy },
    })
    if (!referrer) {
      throw createError({ statusCode: 404, message: 'Referral code not found' })
    }
  }

  // Generate referral code
  const referralCode = `ETS-${randomBytes(6).toString('hex').toUpperCase()}`

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
