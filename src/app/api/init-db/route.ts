import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

// POST /api/init-db — Initialize database tables by attempting operations
// This forces Payload CMS to create missing tables
// eslint-disable-next-line max-lines-per-function -- DB init with multiple global seeds
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if ('error' in auth) return auth.error
    const { payload } = auth
    const results: string[] = []

    // Force table creation by attempting to find/create in each global
    // Payload auto-creates tables on first write operation

    // 1. Initialize HeroSection global
    try {
      await payload.findGlobal({ slug: 'homepage' })
      results.push('✅ homepage table exists')
    } catch {
      try {
        await payload.updateGlobal({
          slug: 'homepage',
          data: {
            taglineEn: 'Rise Together. Conquer the Tower.',
            taglineTh: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
            ctaTextEn: 'Pre-register Now',
            ctaTextTh: 'ลงทะเบียนล่วงหน้าเลย',
            ctaLink: '/event',
            features: [
              { icon: '⚔️', titleEn: 'Combat System', titleTh: 'ระบบต่อสู้', descriptionEn: 'Exciting 4-class dungeon combat', descriptionTh: 'ลุยดันเจี้ยนสุดมัน 4 คลาส' },

              { icon: '🗺️', titleEn: 'Explore the World', titleTh: 'สำรวจโลกกว้าง', descriptionEn: 'Adventure across the vast lands of Arcatea', descriptionTh: 'ผจญภัยในดินแดน Arcatea อันกว้างใหญ่ไพศาล' },
              { icon: '🏰', titleEn: 'Conquer the Tower', titleTh: 'พิชิตหอคอย', descriptionEn: 'Climb The Boundless Spire', descriptionTh: 'ปีนหอคอยนิรันดร์ The Boundless Spire ท้าทายดันเจี้ยนสุดโหด' },
              { icon: '⬆️', titleEn: 'Character Upgrades', titleTh: 'อัพเกรดตัวละคร', descriptionEn: 'Enhance skills, gear, and appearance', descriptionTh: 'พัฒนาทักษะ อุปกรณ์ และรูปลักษณ์ให้แข็งแกร่ง' },
              { icon: '⚡', titleEn: 'PvP Arena', titleTh: 'PvP Arena', descriptionEn: 'Battle other players in real-time', descriptionTh: 'ต่อสู้กับผู้เล่นคนอื่นในสนามประลองแบบเรียลไทม์' },
              { icon: '🤝', titleEn: 'Guilds & Friends', titleTh: 'กิลด์ & เพื่อน', descriptionEn: 'Build guilds and conquer bosses together', descriptionTh: 'สร้างกิลด์ ร่วมมือกับเพื่อนรบพิชิตบอสสุดโหด' },
            ],
          },
        })
        results.push('✅ homepage created & seeded')
      } catch (e) {
        results.push(`⚠️ homepage: ${String(e).slice(0, 100)}`)
      }
    }

    // 2. Initialize SiteSettings global
    try {
      await payload.findGlobal({ slug: 'site-settings' })
      results.push('✅ site-settings table exists')
    } catch {
      try {
        await payload.updateGlobal({
          slug: 'site-settings',
          data: {
            siteName: 'Eternal Tower Saga',
            siteDescription: 'Rise Together. Conquer the Tower.',
            socialLinks: {
              facebook: 'https://facebook.com/EternalTowerSaga',
              youtube: 'https://youtube.com/@EternalTowerSaga',
              discord: 'https://discord.gg/EternalTowerSaga',
              tiktok: 'https://tiktok.com/@EternalTowerSaga',
              twitter: 'https://x.com/EternalTowerSaga',
              line: 'https://line.me/R/ti/p/@eternaltowersaga',
            },
            footerCopyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
            footerTermsUrl: '/terms',
            footerPrivacyUrl: '/privacy',
            footerSupportUrl: '/support',
          },
        })
        results.push('✅ site-settings created & seeded')
      } catch (e) {
        results.push(`⚠️ site-settings: ${String(e).slice(0, 100)}`)
      }
    }

    // 3. Initialize EventConfig global
    try {
      await payload.findGlobal({ slug: 'event-config' })
      results.push('✅ event-config table exists')
    } catch {
      try {
        await payload.updateGlobal({
          slug: 'event-config',
          data: {
            enabled: true,
            titleEn: 'Pre-Register Now',
            titleTh: 'ลงทะเบียนล่วงหน้า',
            descriptionEn: 'Register now to receive exclusive rewards!',
            descriptionTh: 'ลงทะเบียนเลยเพื่อรับรางวัลพิเศษ!',
            countdownTarget: '2026-04-02T23:59:59.000Z',
            registrationOpen: true,
          },
        })
        results.push('✅ event-config created & seeded')
      } catch (e) {
        results.push(`⚠️ event-config: ${String(e).slice(0, 100)}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
