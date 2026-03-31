import { NextRequest, NextResponse } from 'next/server'
import { matchesInternalSecret } from '@/lib/cms-maintenance'

export function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization) return null

  const [scheme, token] = authorization.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null

  return token.trim()
}

export function hasInternalApiAccess(request: NextRequest) {
  return matchesInternalSecret(getBearerToken(request), process.env.PAYLOAD_SECRET)
}

export function internalApiUnauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
