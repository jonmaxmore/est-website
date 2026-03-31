import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/cms-access'
import { getPayloadClient } from '@/lib/payload'

/**
 * Verify that the request comes from an authenticated Payload CMS admin.
 * Returns the user on success, or a NextResponse error to send back.
 */
export async function requireAdmin(request: NextRequest) {
  const hasToken =
    request.cookies.get('payload-token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!hasToken) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 }) }
  }

  if (!isAdmin({ req: { user } })) {
    return { error: NextResponse.json({ error: 'Admin role required' }, { status: 403 }) }
  }

  return { user, payload }
}
