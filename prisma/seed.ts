import { prisma } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Milestones
  const milestones = [
    {
      threshold: 10000,
      titleTh: '10,000 ผู้ลงทะเบียน',
      titleEn: '10,000 Registrations',
      rewards: JSON.stringify([
        { item: 'Gold', qty: 200000, icon: '/images/rewards/gold.png' },
        { item: 'Fatigue Remover Scroll', qty: 10, icon: '/images/rewards/scroll.png' },
      ]),
      isUnlocked: false,
      sortOrder: 1,
    },
    {
      threshold: 25000,
      titleTh: '25,000 ผู้ลงทะเบียน',
      titleEn: '25,000 Registrations',
      rewards: JSON.stringify([
        { item: 'Weapon Upgrade Stone', qty: 100, icon: '/images/rewards/weapon-stone.png' },
        { item: 'Armor Upgrade Stone', qty: 100, icon: '/images/rewards/armor-stone.png' },
      ]),
      isUnlocked: false,
      sortOrder: 2,
    },
    {
      threshold: 50000,
      titleTh: '50,000 ผู้ลงทะเบียน',
      titleEn: '50,000 Registrations',
      rewards: JSON.stringify([
        { item: 'Mana', qty: 12000, icon: '/images/rewards/mana.png' },
        { item: 'Accessory Upgrade Stone', qty: 100, icon: '/images/rewards/accessory-stone.png' },
      ]),
      isUnlocked: false,
      sortOrder: 3,
    },
    {
      threshold: 100000,
      titleTh: '100,000 ผู้ลงทะเบียน',
      titleEn: '100,000 Registrations',
      rewards: JSON.stringify([
        { item: 'Premium Clothing Exchange Ticket', qty: 10, icon: '/images/rewards/clothing-ticket.png' },
      ]),
      isUnlocked: false,
      sortOrder: 4,
    },
    {
      threshold: 150000,
      titleTh: '150,000 ผู้ลงทะเบียน',
      titleEn: '150,000 Registrations',
      rewards: JSON.stringify([
        { item: 'Premium Summon Beast Ticket', qty: 10, icon: '/images/rewards/summon-ticket.png' },
      ]),
      isUnlocked: false,
      sortOrder: 5,
    },
    {
      threshold: 200000,
      titleTh: '200,000 ผู้ลงทะเบียน',
      titleEn: '200,000 Registrations',
      rewards: JSON.stringify([
        { item: "Astrologist's Fortune-Telling House", qty: 1, icon: '/images/rewards/fortune-house.png' },
        { item: 'Skill Reset Potion', qty: 1, icon: '/images/rewards/reset-skill.png' },
        { item: 'Constellation Reset Potion', qty: 1, icon: '/images/rewards/reset-constellation.png' },
        { item: 'Knowledge Reset Potion', qty: 1, icon: '/images/rewards/reset-knowledge.png' },
        { item: 'Seal Reset Potion', qty: 1, icon: '/images/rewards/reset-seal.png' },
      ]),
      isUnlocked: false,
      sortOrder: 6,
    },
  ];

  for (const milestone of milestones) {
    await prisma.milestone.upsert({
      where: { threshold: milestone.threshold },
      update: milestone,
      create: milestone,
    });
  }
  console.log(`✅ Seeded ${milestones.length} milestones`);

  // Seed Event Config
  await prisma.eventConfig.upsert({
    where: { eventKey: 'pre_registration_2026' },
    update: {},
    create: {
      eventKey: 'pre_registration_2026',
      titleTh: 'ลงทะเบียนล่วงหน้า Eternal Tower Saga',
      titleEn: 'Eternal Tower Saga Pre-Registration',
      startDate: new Date('2026-03-16T00:00:00+07:00'),
      endDate: new Date('2026-04-02T23:59:59+07:00'),
      isActive: true,
      settings: JSON.stringify({
        platforms: ['ios', 'android', 'pc'],
        regions: [
          { value: 'th', labelTh: 'ไทย', labelEn: 'Thailand' },
          { value: 'sea', labelTh: 'เอเชียตะวันออกเฉียงใต้', labelEn: 'Southeast Asia' },
          { value: 'global', labelTh: 'ทั่วโลก', labelEn: 'Global' },
        ],
      }),
    },
  });
  console.log('✅ Seeded event config');

  // Seed Game Characters
  const characters = [
    {
      nameTh: 'อาร์เธอร์', nameEn: 'Arthur',
      classTh: 'นักดาบเร่ร่อน', classEn: 'Wandering Swordsman',
      faction: 'light', rarity: 'legendary',
      descTh: 'อัศวินผู้ทรงเกียรติ ผู้ถือดาบแห่งความยุติธรรม',
      descEn: 'An honorable knight who wields the sword of justice',
      portraitUrl: '/images/characters/arthur.png',
      iconUrl: '/images/characters/arthur-icon.png',
      sortOrder: 1, isVisible: true,
    },
    {
      nameTh: 'เอเลน่า', nameEn: 'Elena',
      classTh: 'นักธนูแห่งป่า', classEn: 'Forest Archer',
      faction: 'nature', rarity: 'legendary',
      descTh: 'นักธนูผู้แม่นยำ ปกป้องป่าด้วยลูกศรมรณะ',
      descEn: 'A deadly accurate archer who guards the forest',
      portraitUrl: '/images/characters/elena.png',
      iconUrl: '/images/characters/elena-icon.png',
      sortOrder: 2, isVisible: true,
    },
    {
      nameTh: 'มอร์แกน', nameEn: 'Morgan',
      classTh: 'จอมเวทแห่งคริสตัล', classEn: 'Crystal Mage',
      faction: 'water', rarity: 'epic',
      descTh: 'จอมเวทผู้ควบคุมพลังคริสตัลออร์บอันทรงพลัง',
      descEn: 'A mage who commands the power of the crystal orb',
      portraitUrl: '/images/characters/morgan.png',
      iconUrl: '/images/characters/morgan-icon.png',
      sortOrder: 3, isVisible: true,
    },
    {
      nameTh: 'ไลร่า', nameEn: 'Lyra',
      classTh: 'นักบวชแห่งแสง', classEn: 'Light Priestess',
      faction: 'light', rarity: 'epic',
      descTh: 'นักบวชผู้เยียวยา ใช้ไม้เท้าแห่งแสงรักษาสหาย',
      descEn: 'A healer wielding the wand of light to mend allies',
      portraitUrl: '/images/characters/lyra.png',
      iconUrl: '/images/characters/lyra-icon.png',
      sortOrder: 4, isVisible: true,
    },
  ];

  for (const char of characters) {
    await prisma.gameCharacter.upsert({
      where: { id: char.nameEn.toLowerCase() },
      update: char,
      create: { id: char.nameEn.toLowerCase(), ...char },
    });
  }
  console.log(`✅ Seeded ${characters.length} characters`);

  // Seed sample news
  const news = [
    {
      titleTh: 'Eternal Tower Saga เปิดลงทะเบียนล่วงหน้าแล้ว!',
      titleEn: 'Eternal Tower Saga Pre-Registration is Now Open!',
      contentTh: 'ลงทะเบียนล่วงหน้าวันนี้เพื่อรับรางวัลพิเศษมากมาย',
      contentEn: 'Pre-register today to receive exclusive rewards',
      category: 'event',
      thumbnail: '/images/news/pre-register-open.jpg',
      slug: 'pre-registration-open',
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date('2026-03-16'),
    },
  ];

  for (const n of news) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: n,
      create: n,
    });
  }
  console.log(`✅ Seeded ${news.length} news articles`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
