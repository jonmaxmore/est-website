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
            taglineEn: 'Adventure together, climb higher.',
            taglineTh: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
            ctaTextEn: 'Join the pre-registration',
            ctaTextTh: 'ลงทะเบียนล่วงหน้าเลย',
            ctaLink: '/event',
            features: [
              { icon: '⚔️', titleEn: 'Combat System', titleTh: 'ระบบต่อสู้', descriptionEn: 'Exciting 4-class dungeon combat', descriptionTh: 'ลุยดันเจี้ยนสุดมัน 4 คลาส' },

              { icon: '🗺️', titleEn: 'Explore the World', titleTh: 'สำรวจโลกกว้าง', descriptionEn: 'Travel through Arcatea with routes that stay easy to follow', descriptionTh: 'ออกสำรวจ Arcatea ผ่านเส้นทางที่ตามได้ง่ายและไม่พาหลงทิศ' },
              { icon: '🏰', titleEn: 'Conquer the Tower', titleTh: 'พิชิตหอคอย', descriptionEn: 'Climb The Boundless Spire floor by floor as the challenge tightens', descriptionTh: 'ไต่ The Boundless Spire ไปทีละชั้น ยิ่งสูงยิ่งเข้มข้น' },
              { icon: '⬆️', titleEn: 'Character Upgrades', titleTh: 'อัพเกรดตัวละคร', descriptionEn: 'Improve skills, gear, and appearance with a clearer upgrade path', descriptionTh: 'พัฒนาสกิล อุปกรณ์ และรูปลักษณ์ในเส้นทางอัปเกรดที่ดูง่ายขึ้น' },
              { icon: '⚡', titleEn: 'PvP Arena', titleTh: 'PvP Arena', descriptionEn: 'Step into real-time arena matches against other players', descriptionTh: 'ลงสนาม PvP แบบเรียลไทม์กับผู้เล่นคนอื่น' },
              { icon: '🤝', titleEn: 'Guilds & Friends', titleTh: 'กิลด์ & เพื่อน', descriptionEn: 'Team up with friends and guildmates for bosses and shared goals', descriptionTh: 'ร่วมทีมกับเพื่อนและสมาชิกกิลด์เพื่อจัดการบอสและเป้าหมายร่วมกัน' },
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
            siteDescription: 'Official website for Eternal Tower Saga, with news, guides, and event information.',
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
            titleEn: 'Join the pre-registration',
            titleTh: 'ลงทะเบียนล่วงหน้า',
            descriptionEn: 'Register early to receive launch rewards and follow event milestones in one place.',
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
