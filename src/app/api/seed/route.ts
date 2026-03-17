import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const payload = await getPayloadClient()

    const results: string[] = []

    // 1. Create Admin User
    try {
      await payload.create({
        collection: 'users',
        data: { email: 'admin@eternaltowersaga.com', password: 'Admin@EST2026!', role: 'admin' },
      })
      results.push('✅ Admin user created')
    } catch { results.push('⏭️ Admin user exists') }

    // 2. Seed Milestones
    const milestonesData = [
      { threshold: 10000, rewardEn: 'Gold ×200,000 + Fatigue Scroll ×10', rewardTh: 'ทอง ×200,000 + ม้วนฟื้นพลัง ×10', icon: '💰', sortOrder: 1 },
      { threshold: 25000, rewardEn: 'Weapon Stone ×100 + Armor Stone ×100', rewardTh: 'หินอาวุธ ×100 + หินเกราะ ×100', icon: '⚔️', sortOrder: 2 },
      { threshold: 50000, rewardEn: 'Mana ×12,000 + Accessory Stone ×100', rewardTh: 'มานา ×12,000 + หินเครื่องประดับ ×100', icon: '🔮', sortOrder: 3 },
      { threshold: 100000, rewardEn: 'Clothing Ticket ×10', rewardTh: 'ตั๋วเสื้อผ้า ×10', icon: '👗', sortOrder: 4 },
      { threshold: 150000, rewardEn: 'Summon Ticket ×10', rewardTh: 'ตั๋วอัญเชิญ ×10', icon: '✨', sortOrder: 5 },
      { threshold: 200000, rewardEn: 'Fortune House ×1 + Reset Potions ×4', rewardTh: 'บ้านแห่งโชค ×1 + ยารีเซ็ต ×4', icon: '🏠', sortOrder: 6 },
    ]
    let mCount = 0
    for (const m of milestonesData) {
      try { await payload.create({ collection: 'milestones', data: m }); mCount++ } catch { /* exists */ }
    }
    results.push(`✅ ${mCount} milestones seeded`)

    // 3. Seed Characters (without portraits)
    const charsData = [
      { nameEn: 'Arthur', nameTh: 'อาร์เธอร์', classEn: 'Iron Knight', classTh: 'อัศวินเหล็ก', weaponClass: 'SWORD' as const, faction: 'light' as const, descriptionEn: 'A legendary knight who excels in close combat, balancing offense and defense.', descriptionTh: 'อัศวินในตำนานที่เชี่ยวชาญการรบระยะประชิด สมดุลทั้งรุกและรับ', accentColor: '#FFD700', sortOrder: 1, visible: true },
      { nameEn: 'Elena', nameTh: 'เอเลน่า', classEn: 'Forest Ranger', classTh: 'เจ้าป่า', weaponClass: 'BOW' as const, faction: 'nature' as const, descriptionEn: 'A master archer who strikes from afar, using nature\'s power.', descriptionTh: 'นักธนูผู้เชี่ยวชาญที่โจมตีจากระยะไกล ใช้พลังของธรรมชาติ', accentColor: '#4CAF50', sortOrder: 2, visible: true },
      { nameEn: 'Kaelen', nameTh: 'เคเลน', classEn: 'Shadow Mage', classTh: 'จอมเวทย์เงา', weaponClass: 'CRYSTAL_ORB' as const, faction: 'dark' as const, descriptionEn: 'A mysterious mage wielding dark arcane powers from a distance.', descriptionTh: 'จอมเวทย์ลึกลับผู้ใช้พลังเวทมนตร์มืดจากระยะไกล', accentColor: '#7B1FA2', sortOrder: 3, visible: true },
      { nameEn: 'Lyra', nameTh: 'ไลร่า', classEn: 'Holy Priestess', classTh: 'นักบวชศักดิ์สิทธิ์', weaponClass: 'WAND' as const, faction: 'light' as const, descriptionEn: 'A divine healer who protects allies with holy magic.', descriptionTh: 'นักบวชศักดิ์สิทธิ์ผู้ปกป้องพันธมิตรด้วยเวทมนตร์ศักดิ์สิทธิ์', accentColor: '#E1BEE7', sortOrder: 4, visible: true },
    ]
    let cCount = 0
    for (const c of charsData) {
      try { await payload.create({ collection: 'characters', data: c as any }); cCount++ } catch { /* exists */ }
    }
    results.push(`✅ ${cCount} characters seeded`)

    // 4. Seed News
    const newsData = [
      { titleEn: 'Pre-Registration Officially Opens!', titleTh: 'เปิดลงทะเบียนล่วงหน้าอย่างเป็นทางการ!', slug: 'pre-registration-opens', category: 'event' as const, emoji: '🎉', status: 'published' as const, publishedAt: new Date().toISOString() },
      { titleEn: 'Meet the Mercenary Companion System', titleTh: 'พบกับระบบเมอร์เซนารี คอมพาเนียน', slug: 'mercenary-companion-system', category: 'update' as const, emoji: '⚔️', status: 'published' as const, publishedAt: new Date(Date.now() - 86400000).toISOString() },
      { titleEn: 'Developer Diary: Creating Arcatéa', titleTh: 'บันทึกนักพัฒนา: การสร้างอาร์คาเทีย', slug: 'developer-diary-arcatea', category: 'media' as const, emoji: '📖', status: 'published' as const, publishedAt: new Date(Date.now() - 172800000).toISOString() },
    ]
    let nCount = 0
    for (const n of newsData) {
      try { await payload.create({ collection: 'news', data: n }); nCount++ } catch { /* exists */ }
    }
    results.push(`✅ ${nCount} news articles seeded`)

    // 5. Seed Store Buttons
    const storeData = [
      { platform: 'ios' as const, label: 'App Store', sublabel: 'Pre-order on the', url: '#', sortOrder: 1, visible: true },
      { platform: 'android' as const, label: 'Google Play', sublabel: 'PRE-REGISTER ON', url: '#', sortOrder: 2, visible: true },
      { platform: 'pc' as const, label: 'Windows', sublabel: 'Coming soon', url: '#', sortOrder: 3, visible: true },
    ]
    let sCount = 0
    for (const s of storeData) {
      try { await payload.create({ collection: 'store-buttons', data: s }); sCount++ } catch { /* exists */ }
    }
    results.push(`✅ ${sCount} store buttons seeded`)

    // 6. Set Globals
    try {
      await payload.updateGlobal({
        slug: 'hero-section',
        data: {
          taglineEn: 'Adventure together, conquer the tower',
          taglineTh: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
          ctaTextEn: 'Pre-Register Now',
          ctaTextTh: 'ลงทะเบียนล่วงหน้าเลย',
          ctaLink: '/event',
          mercenarySection: {
            titleEn: 'Mercenary Companion System',
            titleTh: 'ระบบเมอร์เซนารี คอมพาเนียน',
            subtitleEn: 'Battle Companions — Not Just Pets',
            subtitleTh: 'สหายร่วมรบ — ไม่ใช่แค่สัตว์เลี้ยง',
          },
          features: [
            { icon: '⚔️', titleEn: 'Mercenary Companion', titleTh: 'ระบบ Mercenary Companion', descriptionEn: 'Fight alongside companions as equals', descriptionTh: 'ต่อสู้เคียงข้างสหายร่วมรบผู้ทรงพลัง' },
            { icon: '🗺️', titleEn: 'Explore the World', titleTh: 'สำรวจโลกกว้าง', descriptionEn: 'Explore the vast lands of Arcatéa', descriptionTh: 'ผจญภัยในดินแดน Arcatéa อันกว้างใหญ่ไพศาล' },
            { icon: '🏰', titleEn: 'Conquer the Tower', titleTh: 'พิชิตหอคอย', descriptionEn: 'Climb The Boundless Spire', descriptionTh: 'ปีนหอคอยนิรันดร์ The Boundless Spire ท้าทายขั้นเซียนสุดโหด' },
            { icon: '✨', titleEn: 'Upgrade Characters', titleTh: 'อัพเกรดตัวละคร', descriptionEn: 'Develop skills, gear, and appearances', descriptionTh: 'พัฒนาทักษะ อุปกรณ์ และรูปลักษณ์ให้แข็งแกร่ง' },
            { icon: '🏟️', titleEn: 'PvP Arena', titleTh: 'PvP Arena', descriptionEn: 'Challenge other players in real-time', descriptionTh: 'ต่อสู้กับผู้เล่นคนอื่นในสนามประลองแบบเรียลไทม์' },
            { icon: '🤝', titleEn: 'Guilds & Friends', titleTh: 'กิลด์ & เพื่อน', descriptionEn: 'Join guilds and conquer bosses', descriptionTh: 'สร้างกิลด์ ร่วมมือกับเพื่อนเพื่อพิชิตบอสสุดโหด' },
          ],
        },
      })
      results.push('✅ Hero section globals set')
    } catch (e) { results.push(`⚠️ Hero: ${e}`) }

    try {
      await payload.updateGlobal({
        slug: 'site-settings',
        data: {
          siteName: 'Eternal Tower Saga',
          siteDescription: 'Eternal Tower Saga — เกมมือถือ RPG ผจญภัยพร้อมสหายร่วมรบ',
          socialLinks: { facebook: 'https://facebook.com/EternalTowerSaga', tiktok: 'https://tiktok.com/@EternalTowerSaga', youtube: 'https://youtube.com/@EternalTowerSaga', discord: 'https://discord.gg/eternaltowersaga' },
          footer: { copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.', termsUrl: '/terms', privacyUrl: '/privacy', supportUrl: '#' },
        },
      })
      results.push('✅ Site settings set')
    } catch (e) { results.push(`⚠️ Site: ${e}`) }

    try {
      await payload.updateGlobal({
        slug: 'event-config',
        data: {
          enabled: true,
          titleEn: 'Pre-Register Now',
          titleTh: 'ลงทะเบียนล่วงหน้า',
          descriptionEn: 'Register now to receive exclusive rewards at launch!',
          descriptionTh: 'ลงทะเบียนเลยเพื่อรับรางวัลสุดพิเศษเมื่อเปิดตัว!',
          countdownTarget: '2026-04-02T23:59:59.000Z',
          registrationOpen: true,
        },
      })
      results.push('✅ Event config set')
    } catch (e) { results.push(`⚠️ Event: ${e}`) }

    return NextResponse.json({
      success: true,
      results,
      adminLogin: { email: 'admin@eternaltowersaga.com', password: 'Admin@EST2026!' },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
