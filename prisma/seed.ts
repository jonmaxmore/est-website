import { PrismaClient } from '@prisma/client'
import { hashAdminPassword } from '../server/utils/password'

const prisma = new PrismaClient()

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
      status: 'PUBLISHED' as const,
      featuredImage: '/images/news-3.png',
      publishedAt: new Date('2026-04-15'),
      featureOnHome: true,
      homePriority: 3,
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
  ]

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: { key: config.key, value: config.value },
    })
  }
  console.log('  ✅ Site config seeded')

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
