import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line max-lines-per-function
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if ('error' in auth) return auth.error
    const { payload } = auth

    const results: string[] = []

    // 1. Create or update Admin User
    try {
      const existing = await payload.find({ collection: 'users', where: { email: { equals: 'admin@eternaltowersaga.com' } }, limit: 1 })
      if (existing.docs.length > 0) {
        await payload.update({ collection: 'users', id: existing.docs[0].id, data: { password: 'Admin@EST2026!', loginAttempts: 0, lockUntil: '' } })
        results.push('✅ Admin password reset')
      } else {
        await payload.create({ collection: 'users', data: { email: 'admin@eternaltowersaga.com', password: 'Admin@EST2026!', role: 'admin' } })
        results.push('✅ Admin user created')
      }
    } catch (e) { results.push(`⚠️ Admin: ${e}`) }

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

    // 3. Seed Weapons (image-only — portraits/info/bg/icons uploaded via CMS admin)
    const charsData = [
      { name: 'SWORD', sortOrder: 1, visible: true },
      { name: 'BOW', sortOrder: 2, visible: true },
      { name: 'CRYSTAL_ORB', sortOrder: 3, visible: true },
      { name: 'WAND', sortOrder: 4, visible: true },
    ]
    let cCount = 0
    for (const c of charsData) {
      try { await payload.create({ collection: 'characters', data: c as Record<string, unknown> }); cCount++ } catch { /* exists */ }
    }
    results.push(`✅ ${cCount} characters seeded`)

    // 4. Seed News
    const newsData = [
      { titleEn: 'Pre-Registration Officially Opens!', titleTh: 'เปิดลงทะเบียนล่วงหน้าอย่างเป็นทางการ!', slug: 'pre-registration-opens', category: 'event' as const, emoji: '🎉', status: 'published' as const, publishedAt: new Date().toISOString() },
      { titleEn: 'Discover the Combat System', titleTh: 'พบกับระบบการต่อสู้สุดมัน', slug: 'combat-system-reveal', category: 'update' as const, emoji: '⚔️', status: 'published' as const, publishedAt: new Date(Date.now() - 86400000).toISOString() },
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
        slug: 'homepage',
        data: {
          taglineEn: 'Adventure together, conquer the tower',
          taglineTh: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
          ctaTextEn: 'Pre-Register Now',
          ctaTextTh: 'ลงทะเบียนล่วงหน้าเลย',
          ctaLink: '/event',
          features: [
            { icon: '⚔️', titleEn: 'Combat System', titleTh: 'ระบบต่อสู้', descriptionEn: 'Exciting 4-class dungeon combat', descriptionTh: 'ลุยดันเจี้ยนสุดมัน 4 คลาส' },
            { icon: '🗺️', titleEn: 'Explore the World', titleTh: 'สำรวจโลกกว้าง', descriptionEn: 'Explore the vast lands of Arcatéa', descriptionTh: 'ผจญภัยในดินแดน Arcatéa อันกว้างใหญ่ไพศาล' },
            { icon: '🏰', titleEn: 'Conquer the Tower', titleTh: 'พิชิตหอคอย', descriptionEn: 'Climb The Boundless Spire', descriptionTh: 'ปีนหอคอยนิรันดร์ The Boundless Spire ท้าทายขั้นเซียนสุดโหด' },
            { icon: '✨', titleEn: 'Upgrade Characters', titleTh: 'อัพเกรดตัวละคร', descriptionEn: 'Develop skills, gear, and appearances', descriptionTh: 'พัฒนาทักษะ อุปกรณ์ และรูปลักษณ์ให้แข็งแกร่ง' },
            { icon: '🏟️', titleEn: 'PvP Arena', titleTh: 'PvP Arena', descriptionEn: 'Challenge other players in real-time', descriptionTh: 'ต่อสู้กับผู้เล่นคนอื่นในสนามประลองแบบเรียลไทม์' },
            { icon: '🤝', titleEn: 'Guilds & Friends', titleTh: 'กิลด์ & เพื่อน', descriptionEn: 'Join guilds and conquer bosses', descriptionTh: 'สร้างกิลด์ ร่วมมือกับเพื่อนเพื่อพิชิตบอสสุดโหด' },
          ],
          // Story Page
          storyPageBadgeEn: 'LORE',
          storyPageBadgeTh: 'เนื้อเรื่อง',
          storyPageTitleEn: 'Story',
          storyPageTitleTh: 'เนื้อเรื่อง',
          storyPageSubtitleEn: 'The tale of Arcatéa and The Boundless Spire',
          storyPageSubtitleTh: 'เรื่องราวแห่งดินแดน Arcatéa และหอคอยไร้ขอบเขต',
          storySections: [
            { titleEn: 'The World of Arcatéa', titleTh: 'โลกแห่ง Arcatéa', contentEn: 'In the age before memory, the world of Arcatéa was a single, boundless continent — a realm where floating islands drifted above crystalline oceans, and ancient forests stretched to the edge of horizon. The people of this land lived in harmony with the Aether, a primordial energy that flowed through all living things.', contentTh: 'ในยุคก่อนที่ความทรงจำจะเริ่มต้น โลกแห่ง Arcatéa เป็นทวีปเดียวอันไร้ขอบเขต — ดินแดนที่เกาะลอยฟ้าล่องลอยเหนือมหาสมุทรใส และป่าโบราณแผ่ขยายไปจนสุดขอบฟ้า ผู้คนแห่งดินแดนนี้ใช้ชีวิตอย่างกลมเกลียวกับ Aether พลังงานดั้งเดิมที่ไหลผ่านสิ่งมีชีวิตทุกชนิด' },
            { titleEn: 'The Boundless Spire', titleTh: 'หอคอยไร้ขอบเขต', contentEn: 'At the heart of Arcatéa stands The Boundless Spire — a colossal tower that pierces through clouds and reaches into the unknown heavens. Ancient texts speak of it as the Pillar of Creation, the axis upon which the world was formed. No one knows who built it, or what lies at its summit. Those who dare ascend face increasingly deadly floors, each guarded by creatures born of nightmares.', contentTh: 'ณ ใจกลาง Arcatéa ตั้งตระหง่านอยู่หอคอยไร้ขอบเขต — หอคอยมหึมาที่ทะลุเมฆและยื่นขึ้นสู่สวรรค์ที่ไม่มีผู้ใดรู้จัก ตำราโบราณกล่าวถึงมันว่าเป็นเสาหลักแห่งการสร้างสรรค์ แกนกลางที่โลกถูกก่อร่างขึ้น ไม่มีผู้ใดรู้ว่าใครสร้างมัน หรือสิ่งใดซ่อนอยู่ที่ยอดสุด ผู้กล้าที่บังอาจขึ้นไปต้องเผชิญกับชั้นที่อันตรายมากขึ้นเรื่อยๆ' },
            { titleEn: 'The Fracture', titleTh: 'การแตกร้าว', contentEn: 'A thousand years ago, a cataclysmic event known as The Fracture shattered the balance of Aether. The continent split into floating fragments, and dark energy poured from the cracks in reality. Monsters emerged from the shadows, and the once-peaceful lands became battlegrounds. The survivors built new civilizations on the floating platforms, connected by ancient bridges and magic portals.', contentTh: 'เมื่อพันปีก่อน เหตุการณ์หายนะที่เรียกว่า "การแตกร้าว" ได้ทำลายสมดุลของ Aether ทวีปแตกออกเป็นเศษชิ้นส่วนลอยฟ้า และพลังงานมืดหลั่งไหลจากรอยร้าวในความเป็นจริง สัตว์ประหลาดโผล่ออกมาจากเงามืด ดินแดนที่เคยสงบสุขกลายเป็นสมรภูมิ ผู้รอดชีวิตสร้างอารยธรรมใหม่บนแท่นลอยฟ้า เชื่อมต่อกันด้วยสะพานโบราณและประตูเวทมนตร์' },
            { titleEn: 'The Heroes Rise', titleTh: 'วีรบุรุษผงาด', contentEn: 'Now, a new generation of heroes has emerged — warriors, archers, mages, and healers who answer the call to ascend The Boundless Spire. They venture into unknown dangers, each wielding unique weapons and mastering combat styles. Their mission: reach the summit of the tower, uncover the truth of The Fracture, and restore the balance of Aether. The fate of Arcatéa rests in their hands.', contentTh: 'บัดนี้ วีรบุรุษรุ่นใหม่ได้ปรากฏตัว — นักรบ นักธนู จอมเวทย์ และนักบวช ผู้ตอบรับเสียงเรียกให้ขึ้นหอคอยไร้ขอบเขต พวกเขาผจญภัยสู่อันตรายที่ไม่มีใครรู้จัก แต่ละคนถืออาวุธที่ไม่เหมือนกันและมีสไตล์การต่อสู้เฉพาะตัว ภารกิจของพวกเขาคือ ไปถึงยอดหอคอย เปิดเผยความจริงของการแตกร้าว และฟื้นฟูสมดุลของ Aether ชะตากรรมของ Arcatéa อยู่ในมือพวกเขา' },
          ],
          // Game Guide Page
          gameGuideBadgeEn: 'GAME GUIDE',
          gameGuideBadgeTh: 'แนะนำเกม',
          gameGuideTitleEn: 'Game Guide',
          gameGuideTitleTh: 'แนะนำเกม',
          gameGuideSubtitleEn: 'Experience the new era of Eternal Tower Saga — Switch your weapon, shift the battlefield',
          gameGuideSubtitleTh: 'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga — อาวุธเปลี่ยน เกมเปลี่ยน',
          gameGuideFeatures: [
            { icon: 'swords', titleEn: 'Combat System', titleTh: 'ระบบต่อสู้', descriptionEn: 'Exciting 4-class dungeon combat with unique weapon switching mechanics', descriptionTh: 'ลุยดันเจี้ยนสุดมัน 4 คลาส พร้อมระบบเปลี่ยนอาวุธสุดเจ๋ง' },
            { icon: 'map', titleEn: 'Explore Arcatéa', titleTh: 'สำรวจโลก Arcatéa', descriptionEn: 'Explore the vast lands of Arcatéa — discover floating platforms connected in layers', descriptionTh: 'ผจญภัยในดินแดน Arcatéa อันกว้างใหญ่ไพศาล สำรวจแท่นลอยฟ้าที่เชื่อมกันเป็นชั้นๆ' },
            { icon: 'castle', titleEn: 'The Boundless Spire', titleTh: 'หอคอยนิรันดร์', descriptionEn: 'Climb The Boundless Spire — conquer deadly dungeons on each floor', descriptionTh: 'ปีนหอคอยนิรันดร์ The Boundless Spire — ท้าทายดันเจี้ยนสุดโหดในแต่ละชั้น' },
            { icon: 'shield', titleEn: 'PvP Arena', titleTh: 'PvP Arena', descriptionEn: 'Challenge other players in real-time arena battles — prove your strength', descriptionTh: 'ต่อสู้กับผู้เล่นคนอื่นในสนามประลองแบบเรียลไทม์ พิสูจน์ความแกร่ง' },
            { icon: 'sparkles', titleEn: 'Character Upgrades', titleTh: 'อัพเกรดตัวละคร', descriptionEn: 'Develop skills, gear, and appearances — switch weapons, shift the battlefield', descriptionTh: 'พัฒนาทักษะ อุปกรณ์ และรูปลักษณ์ให้แข็งแกร่ง เปลี่ยนอาวุธเปลี่ยนเกม' },
            { icon: 'users', titleEn: 'Guilds & Friends', titleTh: 'กิลด์ & เพื่อน', descriptionEn: 'Build guilds and team up with friends to conquer deadly bosses in special dungeons', descriptionTh: 'สร้างกิลด์ ร่วมมือกับเพื่อนเพื่อพิชิตบอสสุดโหดในดันเจี้ยนพิเศษ' },
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
