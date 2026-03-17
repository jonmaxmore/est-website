import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// POST /api/init-db — Initialize database tables by attempting operations
// This forces Payload CMS to create missing tables
export async function POST() {
  try {
    const payload = await getPayloadClient()
    const results: string[] = []

    // Force table creation by attempting to find/create in each global
    // Payload auto-creates tables on first write operation

    // 1. Initialize HeroSection global
    try {
      await payload.findGlobal({ slug: 'hero-section' })
      results.push('✅ hero-section table exists')
    } catch {
      try {
        await payload.updateGlobal({
          slug: 'hero-section',
          data: {
            taglineEn: 'Rise Together. Conquer the Tower.',
            taglineTh: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
            ctaTextEn: 'Pre-register Now',
            ctaTextTh: 'ลงทะเบียนล่วงหน้าเลย',
            ctaLink: '/event',
            mercenarySectionTitleEn: 'Mercenary Companion System',
            mercenarySectionTitleTh: 'ระบบเมอร์เซนารี คอมพาเนียน',
            mercenarySectionSubtitleEn: 'Fight side by side — Not just pets',
            mercenarySectionSubtitleTh: 'สหายร่วมรบ — ไม่ใช่แค่สัตว์เลี้ยง',
            features: [
              { icon: '⚔️', titleEn: 'Mercenary Companion System', titleTh: 'ระบบ Mercenary Companion', descriptionEn: 'Fight alongside powerful mercenary companions', descriptionTh: 'ต่อสู้เคียงข้างสหายร่วมรบผู้ทรงพลัง ไม่ใช่แค่สัตว์เลี้ยง' },
              { icon: '🗺️', titleEn: 'Explore the World', titleTh: 'สำรวจโลกกว้าง', descriptionEn: 'Adventure across the vast lands of Arcatea', descriptionTh: 'ผจญภัยในดินแดน Arcatea อันกว้างใหญ่ไพศาล' },
              { icon: '🏰', titleEn: 'Conquer the Tower', titleTh: 'พิชิตหอคอย', descriptionEn: 'Climb The Boundless Spire', descriptionTh: 'ปีนหอคอยนิรันดร์ The Boundless Spire ท้าทายดันเจี้ยนสุดโหด' },
              { icon: '⬆️', titleEn: 'Character Upgrades', titleTh: 'อัพเกรดตัวละคร', descriptionEn: 'Enhance skills, gear, and appearance', descriptionTh: 'พัฒนาทักษะ อุปกรณ์ และรูปลักษณ์ให้แข็งแกร่ง' },
              { icon: '⚡', titleEn: 'PvP Arena', titleTh: 'PvP Arena', descriptionEn: 'Battle other players in real-time', descriptionTh: 'ต่อสู้กับผู้เล่นคนอื่นในสนามประลองแบบเรียลไทม์' },
              { icon: '🤝', titleEn: 'Guilds & Friends', titleTh: 'กิลด์ & เพื่อน', descriptionEn: 'Build guilds and conquer bosses together', descriptionTh: 'สร้างกิลด์ ร่วมมือกับเพื่อนรบพิชิตบอสสุดโหด' },
            ],
          },
        })
        results.push('✅ hero-section created & seeded')
      } catch (e) {
        results.push(`⚠️ hero-section: ${String(e).slice(0, 100)}`)
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
