import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { hashAdminPassword } from '../server/utils/password'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never)


async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin User ──
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@eternaltowersaga.com'
  const password = process.env.ADMIN_SEED_PASSWORD || 'admin2026'

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } })
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash: await hashAdminPassword(password),
        displayName: 'Super Admin',
        role: 'SUPER_ADMIN',
      },
    })
    console.log(`  ✅ Admin user created: ${email}`)
  } else {
    console.log(`  ⏭️  Admin user already exists: ${email}`)
  }

  // ── Weapons ──
  const weapons = [
    { name: 'Sword', nameEn: 'Sword', descriptionEn: 'A balanced melee weapon', descriptionTh: 'อาวุธระยะประชิดที่สมดุล', portrait: '/images/characters/weapon-info-sword.png', sortOrder: 1 },
    { name: 'Bow', nameEn: 'Bow', descriptionEn: 'A ranged weapon for agile fighters', descriptionTh: 'อาวุธระยะไกลสำหรับนักสู้คล่องตัว', portrait: '/images/characters/weapon-info-bow.png', sortOrder: 2 },
    { name: 'Wand', nameEn: 'Wand', descriptionEn: 'A magical weapon for spellcasters', descriptionTh: 'อาวุธเวทมนตร์สำหรับผู้ร่ายเวท', portrait: '/images/characters/weapon-info-wand.png', sortOrder: 3 },
    { name: 'Axe', nameEn: 'Axe', descriptionEn: 'A heavy weapon with devastating power', descriptionTh: 'อาวุธหนักที่มีพลังทำลายล้าง', portrait: '/images/characters/weapon-info-axe.png', sortOrder: 4 },
  ]

  for (const w of weapons) {
    await prisma.weapon.upsert({
      where: { id: w.sortOrder },
      update: w,
      create: { ...w, id: w.sortOrder },
    })
  }
  console.log(`  ✅ ${weapons.length} weapons seeded`)

  // ── Milestones ──
  const milestones = [
    { tier: 1, targetCount: 10000, rewardEn: 'Gold Pack x5', rewardTh: 'แพ็คทอง x5', icon: '🎁', sortOrder: 1 },
    { tier: 2, targetCount: 50000, rewardEn: 'Premium Mount', rewardTh: 'พาหนะพิเศษ', icon: '🐴', sortOrder: 2 },
    { tier: 3, targetCount: 100000, rewardEn: 'Legendary Pet', rewardTh: 'สัตว์เลี้ยงระดับตำนาน', icon: '🐉', sortOrder: 3 },
    { tier: 4, targetCount: 300000, rewardEn: 'Exclusive Title', rewardTh: 'ตำแหน่งพิเศษ', icon: '👑', sortOrder: 4 },
    { tier: 5, targetCount: 500000, rewardEn: 'SSR Weapon Skin', rewardTh: 'สกินอาวุธ SSR', icon: '⚔️', sortOrder: 5 },
    { tier: 6, targetCount: 1000000, rewardEn: 'Ultimate Avatar Frame', rewardTh: 'กรอบอวาตาร์สุดยอด', icon: '✨', sortOrder: 6 },
  ]

  for (const m of milestones) {
    await prisma.milestone.upsert({
      where: { tier: m.tier },
      update: m,
      create: m,
    })
  }
  console.log(`  ✅ ${milestones.length} milestones seeded`)

  // ── News Articles ──
  const news = [
    {
      slug: 'pre-registration-open',
      titleEn: 'Pre-Registration Now Open!',
      titleTh: 'เปิดลงทะเบียนล่วงหน้าแล้ว!',
      excerptEn: 'Register now to receive exclusive rewards.',
      excerptTh: 'ลงทะเบียนเพื่อรับรางวัลพิเศษ',
      contentEn: '<p>We are thrilled to announce that pre-registration for Eternal Tower Saga is now open!</p>',
      contentTh: '<p>เรายินดีที่จะประกาศว่าการลงทะเบียนล่วงหน้าสำหรับ Eternal Tower Saga เปิดแล้ว!</p>',
      category: 'ANNOUNCEMENT' as const,
      contentType: 'ANNOUNCEMENT' as const,
      primaryTopicKey: 'getting-started',
      campaignCode: 'pre-registration',
      pinned: true,
      isEvergreen: false,
      readingTimeMinutes: 1,
      status: 'PUBLISHED' as const,
      featuredImage: '/images/news-1.png',
      publishedAt: new Date('2026-04-01'),
      featureOnHome: true,
      homePriority: 1,
    },
    {
      slug: 'closed-beta-test',
      titleEn: 'Closed Beta Test Announced',
      titleTh: 'ประกาศทดสอบ Closed Beta',
      excerptEn: 'Limited spots for the upcoming CBT.',
      excerptTh: 'ที่นั่งจำกัดสำหรับ CBT ที่จะมาถึง',
      contentEn: '<p>Selected pre-registered users will receive CBT access.</p>',
      contentTh: '<p>ผู้ลงทะเบียนล่วงหน้าที่ได้รับคัดเลือกจะได้รับสิทธิ์เข้า CBT</p>',
      category: 'EVENT' as const,
      contentType: 'EVENT' as const,
      primaryTopicKey: 'getting-started',
      campaignCode: 'closed-beta',
      pinned: false,
      isEvergreen: false,
      readingTimeMinutes: 1,
      status: 'PUBLISHED' as const,
      featuredImage: '/images/news-2.png',
      publishedAt: new Date('2026-04-10'),
      featureOnHome: true,
      homePriority: 2,
    },
    {
      slug: 'weapon-system-reveal',
      titleEn: 'Weapon System Deep Dive',
      titleTh: 'เจาะลึกระบบอาวุธ',
      excerptEn: 'Learn about the 4 weapon types.',
      excerptTh: 'ทำความรู้จักกับอาวุธ 4 ประเภท',
      contentEn: '<p>Each weapon type offers a unique playstyle and skill tree.</p>',
      contentTh: '<p>อาวุธแต่ละประเภทมีสไตล์การเล่นและสกิลทรีที่เป็นเอกลักษณ์</p>',
      category: 'UPDATE' as const,
      contentType: 'GUIDE' as const,
      primaryTopicKey: 'getting-started',
      pinned: false,
      isEvergreen: true,
      readingTimeMinutes: 1,
      status: 'PUBLISHED' as const,
      featuredImage: '/images/news-3.png',
      publishedAt: new Date('2026-04-15'),
      featureOnHome: true,
      homePriority: 3,
    },
    {
      slug: 'ets-beginner-guide',
      titleEn: 'ETS Beginner Guide',
      titleTh: 'ETS Beginner Guide',
      excerptEn: 'Your first-day checklist for Eternal Tower Saga.',
      excerptTh: 'Your first-day checklist for Eternal Tower Saga.',
      contentEn: '<p>Start with the tutorial, claim your launch rewards, and focus on your first weapon path.</p>',
      contentTh: '<p>Start with the tutorial, claim your launch rewards, and focus on your first weapon path.</p>',
      category: 'UPDATE' as const,
      contentType: 'GUIDE' as const,
      primaryTopicKey: 'getting-started',
      status: 'PUBLISHED' as const,
      featuredImage: '/images/news-3.png',
      publishedAt: new Date('2026-04-22T09:00:00.000Z'),
      featureOnHome: true,
      homePriority: 4,
      pinned: true,
      isEvergreen: true,
      readingTimeMinutes: 1,
    },
    {
      slug: 'season-zero-patch-notes',
      titleEn: 'Season Zero Patch Notes',
      titleTh: 'Season Zero Patch Notes',
      excerptEn: 'Balance changes and launch-week fixes.',
      excerptTh: 'Balance changes and launch-week fixes.',
      contentEn: '<p>Adjusted early-game rewards, fixed launcher issues, and improved tutorial pacing.</p>',
      contentTh: '<p>Adjusted early-game rewards, fixed launcher issues, and improved tutorial pacing.</p>',
      category: 'UPDATE' as const,
      contentType: 'PATCH_NOTES' as const,
      primaryTopicKey: 'getting-started',
      campaignCode: 'launch-week',
      status: 'PUBLISHED' as const,
      featuredImage: '/images/news-1.png',
      publishedAt: new Date('2026-04-22T10:00:00.000Z'),
      featureOnHome: false,
      homePriority: 0,
      pinned: false,
      isEvergreen: false,
      readingTimeMinutes: 1,
    },
  ]

  for (const article of news) {
    await prisma.newsArticle.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    })
  }
  console.log(`  ✅ ${news.length} news articles seeded`)

  const beginnerGuide = await prisma.newsArticle.findUnique({ where: { slug: 'ets-beginner-guide' } })
  if (beginnerGuide) {
    await prisma.marketingBanner.upsert({
      where: { id: 'seed-launch-week-announcement' },
      update: {
        placement: 'announcement_bar',
        status: 'LIVE',
        scope: 'global',
        priority: 100,
        campaignCode: 'launch-week',
        badgeEn: 'Launch Week',
        badgeTh: 'Launch Week',
        titleEn: 'Read the ETS Beginner Guide',
        titleTh: 'Read the ETS Beginner Guide',
        bodyEn: 'Start strong with the launch-week checklist.',
        bodyTh: 'Start strong with the launch-week checklist.',
        targetType: 'article',
        targetArticleId: beginnerGuide.id,
        targetNewTab: false,
        dismissible: true,
        isActive: true,
        config: { tone: 'default', sticky: true },
      },
      create: {
        id: 'seed-launch-week-announcement',
        placement: 'announcement_bar',
        status: 'LIVE',
        scope: 'global',
        priority: 100,
        campaignCode: 'launch-week',
        badgeEn: 'Launch Week',
        badgeTh: 'Launch Week',
        titleEn: 'Read the ETS Beginner Guide',
        titleTh: 'Read the ETS Beginner Guide',
        bodyEn: 'Start strong with the launch-week checklist.',
        bodyTh: 'Start strong with the launch-week checklist.',
        targetType: 'article',
        targetArticleId: beginnerGuide.id,
        targetNewTab: false,
        dismissible: true,
        isActive: true,
        config: { tone: 'default', sticky: true },
      },
    })
    console.log('  ✅ Launch-week announcement banner seeded')
  }

  // ── Site Config ──
  const configs = [
    {
      key: 'navigation',
      value: [
        { labelEn: 'Home', labelTh: 'หน้าแรก', href: '/' },
        { labelEn: 'Weapons', labelTh: 'อาวุธ', href: '/weapons' },
        { labelEn: 'News', labelTh: 'ข่าวสาร', href: '/news' },
        { labelEn: 'Game Guide', labelTh: 'คู่มือเกม', href: '/game-guide' },
        { labelEn: 'Support', labelTh: 'ช่วยเหลือ', href: '/support' },
      ],
    },
    {
      key: 'seo',
      value: {
        titleEn: 'Eternal Tower Saga',
        titleTh: 'Eternal Tower Saga — เกม RPG บนมือถือ',
        descriptionEn: 'Adventure together, climb higher. A new K-MMORPG for mobile.',
        descriptionTh: 'ผจญภัยร่วมกัน ปีนหอคอยให้สูงขึ้น เกม K-MMORPG บนมือถือ',
      },
    },
    {
      key: 'webzine_topics',
      value: [
        {
          key: 'getting-started',
          slug: 'getting-started',
          labelEn: 'Getting Started',
          labelTh: 'Getting Started',
          descriptionEn: 'Beginner and onboarding content for new players.',
          descriptionTh: 'Beginner and onboarding content for new players.',
          icon: 'i-lucide-compass',
          color: '#d4a843',
          visible: true,
        },
        {
          key: 'world-lore',
          slug: 'world-lore',
          labelEn: 'World Lore',
          labelTh: 'World Lore',
          descriptionEn: 'Story, factions, and lore primers.',
          descriptionTh: 'Story, factions, and lore primers.',
          icon: 'i-lucide-book-open',
          color: '#8b5cf6',
          visible: true,
        },
      ],
    },
  ]

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: { key: config.key, value: config.value },
    })
  }
  console.log('  ✅ Site config seeded')

  // ── Features ──
  const features = [
    { key: 'openWorld', titleEn: 'Open World', titleTh: 'โลกเปิดกว้าง', descriptionEn: 'Explore a vast, seamless open world', descriptionTh: 'สำรวจโลกเปิดกว้างอันไร้ขอบเขต', detailEn: 'Immerse yourself in a breathtaking open world spanning over 100 unique zones. From the crystalline peaks of the Frost Spire Mountains to the ancient ruins of the Forgotten Kingdom, every corner of the world tells a story. Dynamic weather systems, day-night cycles, and real-time environmental events make every journey feel unique.', detailTh: 'ดื่มด่ำกับโลกเปิดกว้างที่น่าทึ่งซึ่งครอบคลุมกว่า 100 โซนที่ไม่ซ้ำกัน ตั้งแต่ยอดเขาน้ำแข็งไปจนถึงซากปรักหักพังของอาณาจักรที่ถูกลืม ทุกมุมของโลกมีเรื่องราวเป็นของตัวเอง', icon: '🌍', image: '/images/features/open-world.webp', sortOrder: 1 },
    { key: 'realTimePvP', titleEn: 'Real-Time PvP', titleTh: 'PvP แบบเรียลไทม์', descriptionEn: 'Epic real-time battles against other players', descriptionTh: 'ศึกต่อสู้สุดมหากาพย์กับผู้เล่นคนอื่น', detailEn: 'Experience heart-pounding real-time PvP combat with skill-based mechanics. Compete in 1v1 arenas, 3v3 team battles, and massive 50v50 guild wars. Our advanced matchmaking system ensures fair and exciting matches every time.', detailTh: 'สัมผัสการต่อสู้ PvP แบบเรียลไทม์ที่เน้นทักษะ แข่งขันในสนาม 1v1 ต่อสู้ทีม 3v3 และสงครามกิลด์ขนาดใหญ่ 50v50', icon: '⚔️', image: '/images/features/pvp.webp', sortOrder: 2 },
    { key: 'guildSystem', titleEn: 'Guild System', titleTh: 'ระบบกิลด์', descriptionEn: 'Build your guild and dominate', descriptionTh: 'สร้างกิลด์ของคุณและครองอำนาจ', detailEn: 'Create or join guilds with up to 100 members. Unlock guild skills, build your guild hall, and compete in weekly Guild Territory Wars. Lead your alliance to control valuable resource zones and earn exclusive guild-only rewards.', detailTh: 'สร้างหรือเข้าร่วมกิลด์ได้สูงสุด 100 คน ปลดล็อคสกิลกิลด์ สร้างกิลด์ฮอลล์ และแข่งขันในสงครามดินแดนกิลด์ประจำสัปดาห์', icon: '🏰', image: '/images/features/guild.webp', sortOrder: 3 },
    { key: 'petSystem', titleEn: 'Pet System', titleTh: 'ระบบสัตว์เลี้ยง', descriptionEn: 'Collect and raise magical companions', descriptionTh: 'สะสมและเลี้ยงดูสัตว์ผู้ช่วยสุดมหัศจรรย์', detailEn: 'Discover over 50 unique pets, each with special abilities. Raise, evolve, and customize your companions. Pets provide combat buffs, gathering bonuses, and unique mount transformations. Trade rare pets with other players in the marketplace.', detailTh: 'ค้นพบสัตว์เลี้ยงที่ไม่ซ้ำกันกว่า 50 ตัว แต่ละตัวมีความสามารถพิเศษ เลี้ยงดู วิวัฒนาการ และปรับแต่งสหายของคุณ', icon: '🐉', image: '/images/features/pets.webp', sortOrder: 4 },
    { key: 'craftSystem', titleEn: 'Crafting System', titleTh: 'ระบบคราฟต์', descriptionEn: 'Forge legendary equipment', descriptionTh: 'หลอมอุปกรณ์ระดับตำนาน', detailEn: 'Master 8 crafting professions including Blacksmithing, Alchemy, Enchanting, and Jewelcrafting. Gather rare materials from dungeons and the open world to create powerful equipment. Experiment with different ingredient combinations to discover unique recipes.', detailTh: 'เชี่ยวชาญ 8 สายอาชีพคราฟต์รวมถึงตีเหล็ก เล่นแร่แปรธาตุ ร่ายเวท และทำอัญมณี รวบรวมวัตถุดิบหายากจากดันเจี้ยนเพื่อสร้างอุปกรณ์ทรงพลัง', icon: '🔨', image: '/images/features/craft.webp', sortOrder: 5 },
    { key: 'towerClimb', titleEn: 'Tower Climb', titleTh: 'ปีนหอคอย', descriptionEn: 'Ascend the Eternal Tower', descriptionTh: 'พิชิตหอคอยนิรันดร์', detailEn: 'Challenge the Eternal Tower — an ever-changing dungeon with 200+ floors. Each floor features unique enemies, puzzles, and boss encounters. Climb higher to unlock exclusive rewards, titles, and leaderboard rankings. Team up with friends or brave it solo.', detailTh: 'ท้าทายหอคอยนิรันดร์ — ดันเจี้ยนที่เปลี่ยนแปลงตลอดเวลากว่า 200 ชั้น แต่ละชั้นมีศัตรู ปริศนา และบอสที่ไม่ซ้ำกัน ปีนสูงขึ้นเพื่อปลดล็อครางวัลพิเศษ', icon: '🗼', image: '/images/features/tower.webp', sortOrder: 6 },
  ]

  for (const f of features) {
    await prisma.feature.upsert({
      where: { key: f.key },
      update: f,
      create: f,
    })
  }
  console.log(`  ✅ ${features.length} features seeded`)

  // ── Highlights ──
  const highlights = [
    { key: 'graphics', titleEn: 'K-Fantasy Graphics', titleTh: 'กราฟฟิกสไตล์ K-Fantasy', descriptionEn: 'Stunning visuals with Korean fantasy aesthetic', descriptionTh: 'ภาพสวยงามสไตล์แฟนตาซีเกาหลี', detailEn: 'Experience next-generation mobile graphics powered by Unity Engine. Our art team has crafted every environment, character, and effect with meticulous attention to detail. From particle effects to dynamic lighting, every visual element creates an immersive K-Fantasy world that rivals PC-quality games.', detailTh: 'สัมผัสกราฟฟิกมือถือยุคใหม่ขับเคลื่อนด้วย Unity Engine ทีมศิลป์ของเราออกแบบทุกสภาพแวดล้อม ตัวละคร และเอฟเฟกต์อย่างพิถีพิถัน', icon: '✨', image: '/images/highlights/k-fantasy.webp', sortOrder: 1 },
    { key: 'crossPlatform', titleEn: 'Cross-Platform Play', titleTh: 'เล่นข้ามแพลตฟอร์ม', descriptionEn: 'Play on iOS, Android, and PC', descriptionTh: 'เล่นได้ทั้ง iOS, Android และ PC', detailEn: 'Play seamlessly across all your devices. Start a dungeon run on your phone during commute, then switch to PC for intense guild wars. Your progress, inventory, and friends list sync automatically. Support for controllers, keyboard+mouse, and touch controls.', detailTh: 'เล่นได้อย่างราบรื่นบนทุกอุปกรณ์ เริ่มตีดันเจี้ยนบนมือถือตอนเดินทาง แล้วสลับมา PC สำหรับสงครามกิลด์ ข้อมูลทั้งหมดซิงค์อัตโนมัติ', icon: '📱', image: '/images/highlights/cross-play.webp', sortOrder: 2 },
    { key: 'freeToPlay', titleEn: 'Free to Play', titleTh: 'เล่นฟรี', descriptionEn: 'No pay-to-win, cosmetic only', descriptionTh: 'ไม่ Pay-to-Win มีแค่เครื่องสำอาง', detailEn: 'Eternal Tower Saga is completely free to download and play. Our monetization is 100% cosmetic — skins, mounts, and visual effects only. No gameplay advantages can be purchased. We believe in fair play and earning power through skill and dedication.', detailTh: 'Eternal Tower Saga ดาวน์โหลดและเล่นฟรีทั้งหมด การสร้างรายได้ของเราเป็นเครื่องสำอาง 100% — สกิน, พาหนะ และเอฟเฟกต์ภาพเท่านั้น ไม่สามารถซื้อข้อได้เปรียบในเกมได้', icon: '🎮', image: '/images/highlights/free.webp', sortOrder: 3 },
  ]

  for (const h of highlights) {
    await prisma.highlight.upsert({
      where: { key: h.key },
      update: h,
      create: h,
    })
  }
  console.log(`  ✅ ${highlights.length} highlights seeded`)

  // ── Page Content ──
  const pageContents = [
    { key: 'faq', titleEn: 'FAQ', titleTh: 'คำถามที่พบบ่อย', icon: '❓' },
    { key: 'terms', titleEn: 'Terms of Service', titleTh: 'เงื่อนไขการใช้งาน', icon: '📜' },
    { key: 'privacy', titleEn: 'Privacy Policy', titleTh: 'นโยบายความเป็นส่วนตัว', icon: '🔒' },
    { key: 'support', titleEn: 'Support', titleTh: 'ศูนย์ช่วยเหลือ', icon: '🎧' },
    { key: 'story', titleEn: 'Story', titleTh: 'เนื้อเรื่อง', icon: '📖' },
    { key: 'game-guide', titleEn: 'Game Guide', titleTh: 'คู่มือเกม', icon: '🗺️' },
    { key: 'gallery', titleEn: 'Gallery', titleTh: 'แกลเลอรี่', icon: '🖼️' },
    { key: 'download', titleEn: 'Download', titleTh: 'ดาวน์โหลด', icon: '📥' },
  ]

  const pageContentMeta: Record<string, { description: string; icon: string; contentEn?: string; contentTh?: string; showInHeader?: boolean; showInFooter?: boolean; headerOrder?: number; footerOrder?: number }> = {
    faq: { description: 'Frequently asked questions', icon: 'i-lucide-help-circle', showInFooter: true, footerOrder: 1 },
    terms: {
      description: 'Terms and conditions',
      icon: 'i-lucide-file-text',
      contentEn: `<p>Last updated: April 2026</p><h2>1. Acceptance of Terms</h2><p>By accessing or using Eternal Tower Saga, you agree to be bound by these Terms of Service.</p><h2>2. Account Registration</h2><p>You must provide accurate and complete information during registration. You are responsible for maintaining the security of your account.</p><h2>3. Prohibited Conduct</h2><p>Users may not engage in cheating, hacking, harassment, or any activity that disrupts the game experience.</p><h2>4. Virtual Items</h2><p>Virtual items are licensed, not sold. We may modify or remove virtual items at any time.</p><h2>5. Limitation of Liability</h2><p>The game is provided as is without warranties. We are not liable for damages arising from use of the game.</p><h2>6. Changes to Terms</h2><p>We reserve the right to update these terms at any time. Continued use constitutes acceptance of the updated terms.</p>`,
      showInFooter: true,
      footerOrder: 2,
    },
    privacy: {
      description: 'Privacy and data policy',
      icon: 'i-lucide-shield',
      contentEn: `<p>Last updated: April 2026</p><h2>1. Information We Collect</h2><p>We collect email addresses, platform preferences, and usage analytics to improve the game experience.</p><h2>2. How We Use Your Data</h2><p>Your data is used for account management, game improvements, and marketing communications where you opt in.</p><h2>3. Data Sharing</h2><p>We do not sell personal data. Data may be shared with analytics providers under strict data processing agreements.</p><h2>4. Data Retention</h2><p>Personal data is retained for the duration of your account. You may request deletion at any time.</p><h2>5. Your Rights</h2><p>Under applicable privacy laws, you can request access, correction, and deletion of your personal data.</p><h2>6. Contact</h2><p>For privacy inquiries, email <a href="mailto:privacy@eternaltowersaga.com">privacy@eternaltowersaga.com</a>.</p>`,
      showInFooter: true,
      footerOrder: 3,
    },
    support: {
      description: 'Customer support page',
      icon: 'i-lucide-headphones',
      contentEn: `<p>Need help with Eternal Tower Saga? Reach out to our support team and community channels below.</p><h2>Email Support</h2><p>Send us a message and our team will respond within 24 hours at <a href="mailto:support@eternaltowersaga.com">support@eternaltowersaga.com</a>.</p><h2>Discord Community</h2><p>Join our official community server for announcements, live help, and feedback: <a href="https://discord.gg/eternaltowersaga" target="_blank" rel="noreferrer">discord.gg/eternaltowersaga</a>.</p><h2>Frequently Asked Questions</h2><p>Looking for common answers first? Visit the <a href="/faq">FAQ page</a>.</p>`,
      showInHeader: true,
      headerOrder: 5,
    },
    story: {
      description: 'Game story and lore',
      icon: 'i-lucide-book-open',
      contentEn: `<p>In a world where the skies are scarred by a tower that stretches beyond the clouds, civilizations rise and fall in its shadow. The Eternal Tower promises limitless power to those who reach its summit.</p><p>For centuries, warriors, mages, and rogues have attempted the climb. None have returned from the upper floors. Legends speak of a guardian at the apex who destroys all who approach.</p><p>But a new age of heroes has dawned. As a mercenary chosen by fate, you must gather allies, forge legendary weapons, and uncover the truth hidden within the tower's walls.</p><p>The question is not whether you can reach the top. It is whether you are prepared for what awaits.</p><p><a href="/event">Begin your journey</a></p>`,
    },
    'game-guide': {
      description: 'Game guide and tutorials',
      icon: 'i-lucide-map',
      contentEn: `<h2>Combat System</h2><ul><li><strong>Weapon Types:</strong> Choose from Sword, Bow, Wand, and Axe. Each offers a distinct skill tree.</li><li><strong>Combo Timing:</strong> Chain skills together for stronger burst damage and crowd control.</li><li><strong>Elemental Advantage:</strong> Fire, Ice, Lightning, and Nature create matchup advantages in key encounters.</li></ul><h2>Tower System</h2><ul><li><strong>Infinite Floors:</strong> The Eternal Tower grows harder with every climb.</li><li><strong>Weekly Reset:</strong> Rankings reset weekly and reward top climbers.</li><li><strong>Co-op Challenges:</strong> Tackle special floors with your party for better loot.</li></ul><h2>Guild System</h2><ul><li><strong>Guild Wars:</strong> Coordinate large scale battles for territory control.</li><li><strong>Guild Dungeons:</strong> Unlock exclusive PvE content with your team.</li><li><strong>Guild Missions:</strong> Complete weekly objectives to climb the rankings.</li></ul>`,
      showInHeader: true,
      headerOrder: 4,
    },
    gallery: {
      description: 'Screenshots and artwork',
      icon: 'i-lucide-image',
      contentEn: `<p>Explore official screenshots and key art from Eternal Tower Saga.</p><p><img src="/images/hero-bg.webp" alt="Eternal Tower Saga world"></p><p><img src="/images/mercenary-companions.webp" alt="Mercenary companions"></p><p><img src="/images/characters/weapon-info-sword.png" alt="Sword warrior"></p><p><img src="/images/characters/weapon-info-bow.png" alt="Bow hunter"></p><p><img src="/images/characters/weapon-info-wand.png" alt="Wand mage"></p><p><img src="/images/characters/weapon-info-axe.png" alt="Axe berserker"></p>`,
    },
    download: {
      description: 'Download links',
      icon: 'i-lucide-download',
      contentEn: `<p>Download Eternal Tower Saga on iOS, Android, and PC when the game launches.</p><p>The game is currently in pre-registration. Download links will be published here as soon as release begins.</p><p><a href="/event">Pre-register now</a></p>`,
    },
  }

  for (const pc of pageContents) {
    const meta = pageContentMeta[pc.key] || { description: '', icon: pc.icon || '' }

    await prisma.pageContent.upsert({
      where: { key: pc.key },
      update: {
        ...pc,
        slug: pc.key,
        description: meta.description,
        template: 'default',
        seoTitle: pc.titleEn,
        seoTitleTh: pc.titleTh,
        seoDesc: meta.description,
        icon: meta.icon,
        contentEn: meta.contentEn || '',
        contentTh: meta.contentTh || '',
        showInHeader: meta.showInHeader || false,
        showInFooter: meta.showInFooter || false,
        headerOrder: meta.headerOrder || 0,
        footerOrder: meta.footerOrder || 0,
        isSystemPage: true,
      },
      create: {
        ...pc,
        slug: pc.key,
        description: meta.description,
        template: 'default',
        seoTitle: pc.titleEn,
        seoTitleTh: pc.titleTh,
        seoDesc: meta.description,
        icon: meta.icon,
        contentEn: meta.contentEn || '',
        contentTh: meta.contentTh || '',
        showInHeader: meta.showInHeader || false,
        showInFooter: meta.showInFooter || false,
        headerOrder: meta.headerOrder || 0,
        footerOrder: meta.footerOrder || 0,
        isSystemPage: true,
      },
    })
  }
  console.log(`  ✅ ${pageContents.length} page contents seeded`)

  // ── FAQ config ──
  await prisma.siteConfig.upsert({
    where: { key: 'faq' },
    update: {
      value: [
        { labelEn: 'What is Eternal Tower Saga?', labelTh: 'Eternal Tower Saga คืออะไร?', contentEn: 'Eternal Tower Saga is a mobile MMORPG with K-Fantasy aesthetic, featuring real-time combat, guild system, and an infinite tower challenge.', contentTh: 'Eternal Tower Saga เป็นเกม MMORPG บนมือถือสไตล์ K-Fantasy มีการต่อสู้แบบเรียลไทม์ ระบบกิลด์ และท้าทายหอคอยอันไม่มีที่สิ้นสุด', visible: true },
        { labelEn: 'What platforms are supported?', labelTh: 'รองรับแพลตฟอร์มอะไรบ้าง?', contentEn: 'ETS will be available on iOS, Android, and PC via an official client.', contentTh: 'ETS จะเปิดให้บริการบน iOS, Android และ PC ผ่านไคลเอนต์อย่างเป็นทางการ', visible: true },
        { labelEn: 'When is the release date?', labelTh: 'วันเปิดให้บริการคือเมื่อไหร่?', contentEn: 'The official release date will be announced after CBT. Pre-register now to get early access!', contentTh: 'วันเปิดให้บริการจะประกาศหลัง CBT ลงทะเบียนล่วงหน้าตอนนี้เพื่อรับสิทธิ์เข้าร่วมก่อนใคร!', visible: true },
        { labelEn: 'Is the game free to play?', labelTh: 'เกมนี้เล่นฟรีไหม?', contentEn: 'Yes! ETS is free-to-play with optional cosmetic purchases. No pay-to-win mechanics.', contentTh: 'ใช่! ETS เล่นฟรีพร้อมการซื้อเครื่องสำอางเสริม ไม่มีระบบ Pay-to-Win', visible: true },
        { labelEn: 'How do I pre-register?', labelTh: 'ลงทะเบียนล่วงหน้าได้อย่างไร?', contentEn: 'Visit the Event page and enter your email to pre-register. You will receive exclusive rewards upon launch.', contentTh: 'ไปที่หน้า Event และกรอกอีเมลเพื่อลงทะเบียนล่วงหน้า คุณจะได้รับรางวัลพิเศษเมื่อเปิดให้บริการ', visible: true },
        { labelEn: 'What languages are supported?', labelTh: 'รองรับภาษาอะไรบ้าง?', contentEn: 'ETS supports Thai and English, with more languages planned for the global release.', contentTh: 'ETS รองรับภาษาไทยและอังกฤษ โดยมีแผนเพิ่มภาษาอื่นสำหรับเวอร์ชันทั่วโลก', visible: true },
        { labelEn: 'How do I contact support?', labelTh: 'ติดต่อฝ่ายสนับสนุนได้อย่างไร?', contentEn: 'Visit the Support page or email us at support@eternaltowersaga.com.', contentTh: 'ไปที่หน้า Support หรืออีเมลมาที่ support@eternaltowersaga.com', visible: true },
      ],
    },
    create: {
      key: 'faq',
      value: [
        { labelEn: 'What is Eternal Tower Saga?', labelTh: 'Eternal Tower Saga คืออะไร?', contentEn: 'Eternal Tower Saga is a mobile MMORPG with K-Fantasy aesthetic, featuring real-time combat, guild system, and an infinite tower challenge.', contentTh: 'Eternal Tower Saga เป็นเกม MMORPG บนมือถือสไตล์ K-Fantasy มีการต่อสู้แบบเรียลไทม์ ระบบกิลด์ และท้าทายหอคอยอันไม่มีที่สิ้นสุด', visible: true },
        { labelEn: 'What platforms are supported?', labelTh: 'รองรับแพลตฟอร์มอะไรบ้าง?', contentEn: 'ETS will be available on iOS, Android, and PC via an official client.', contentTh: 'ETS จะเปิดให้บริการบน iOS, Android และ PC ผ่านไคลเอนต์อย่างเป็นทางการ', visible: true },
        { labelEn: 'When is the release date?', labelTh: 'วันเปิดให้บริการคือเมื่อไหร่?', contentEn: 'The official release date will be announced after CBT. Pre-register now to get early access!', contentTh: 'วันเปิดให้บริการจะประกาศหลัง CBT ลงทะเบียนล่วงหน้าตอนนี้เพื่อรับสิทธิ์เข้าร่วมก่อนใคร!', visible: true },
        { labelEn: 'Is the game free to play?', labelTh: 'เกมนี้เล่นฟรีไหม?', contentEn: 'Yes! ETS is free-to-play with optional cosmetic purchases. No pay-to-win mechanics.', contentTh: 'ใช่! ETS เล่นฟรีพร้อมการซื้อเครื่องสำอางเสริม ไม่มีระบบ Pay-to-Win', visible: true },
        { labelEn: 'How do I pre-register?', labelTh: 'ลงทะเบียนล่วงหน้าได้อย่างไร?', contentEn: 'Visit the Event page and enter your email to pre-register. You will receive exclusive rewards upon launch.', contentTh: 'ไปที่หน้า Event และกรอกอีเมลเพื่อลงทะเบียนล่วงหน้า คุณจะได้รับรางวัลพิเศษเมื่อเปิดให้บริการ', visible: true },
        { labelEn: 'What languages are supported?', labelTh: 'รองรับภาษาอะไรบ้าง?', contentEn: 'ETS supports Thai and English, with more languages planned for the global release.', contentTh: 'ETS รองรับภาษาไทยและอังกฤษ โดยมีแผนเพิ่มภาษาอื่นสำหรับเวอร์ชันทั่วโลก', visible: true },
        { labelEn: 'How do I contact support?', labelTh: 'ติดต่อฝ่ายสนับสนุนได้อย่างไร?', contentEn: 'Visit the Support page or email us at support@eternaltowersaga.com.', contentTh: 'ไปที่หน้า Support หรืออีเมลมาที่ support@eternaltowersaga.com', visible: true },
      ],
    },
  })
  console.log('  ✅ FAQ config seeded')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

