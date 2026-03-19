import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// GET /api/admin-reset — Temporary endpoint to create/reset admin user
// DELETE THIS FILE AFTER USE
export async function GET() {
  try {
    const payload = await getPayloadClient()
    
    const email = 'admin@eternaltowersaga.com'
    const password = 'Admin2026!'
    
    // Check if user exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
    })
    
    if (existing.docs.length > 0) {
      // Delete existing user and recreate
      await payload.delete({
        collection: 'users',
        id: existing.docs[0].id,
      })
    }
    
    // Create new admin user
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        role: 'admin',
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created/reset successfully',
      email,
      password,
      userId: user.id,
      note: 'DELETE /api/admin-reset/route.ts after use!',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
