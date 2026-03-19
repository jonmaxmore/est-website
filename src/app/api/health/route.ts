import { NextResponse } from 'next/server'

/**
 * GET /api/health — Health check endpoint
 * Returns server status, uptime, and timestamp.
 */
export async function GET() {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  }

  return NextResponse.json(healthData, { status: 200 })
}
