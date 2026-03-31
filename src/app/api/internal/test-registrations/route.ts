import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { internalApiUnauthorizedResponse, hasInternalApiAccess } from '@/lib/internal-api-auth'

export const dynamic = 'force-dynamic'

const VERIFY_EMAIL_PATTERN = /\+verify[-\w]*@/i

function isSafeVerificationEmail(value: unknown): value is string {
  return typeof value === 'string' && VERIFY_EMAIL_PATTERN.test(value.trim())
}

export async function POST(request: NextRequest) {
  try {
    if (!hasInternalApiAccess(request)) {
      return internalApiUnauthorizedResponse()
    }

    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!isSafeVerificationEmail(email)) {
      return NextResponse.json({
        error: 'Cleanup is restricted to verification emails containing +verify in the local part.',
      }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'registrations',
      where: { email: { equals: email } },
      limit: 10,
      overrideAccess: true,
    })

    for (const registration of result.docs) {
      await payload.delete({
        collection: 'registrations',
        id: registration.id,
        overrideAccess: true,
      })
    }

    return NextResponse.json({
      success: true,
      email,
      deletedCount: result.docs.length,
    })
  } catch (error) {
    console.error('Internal test registration cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clean verification registrations',
    }, { status: 500 })
  }
}
