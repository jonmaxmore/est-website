/**
 * Payload CMS Seed Script
 * Populates all collections with initial game data
 * Run: npx tsx src/seed.ts
 */
import { getPayload, type Payload } from 'payload';
import config from './payload.config';

type SeedRecord = Record<string, unknown>;

const ADMIN_USER = {
  email: 'admin@eternaltowersaga.com',
  password: 'Admin@EST2026!',
  role: 'admin',
} as const;

const MILESTONES = [
  { threshold: 10000, rewardEn: 'Gold ×200,000 + Fatigue Scroll ×10', rewardTh: 'ทอง ×200,000 + ม้วนฟื้นพลัง ×10', icon: '💰', sortOrder: 1 },
  { threshold: 25000, rewardEn: 'Weapon Stone ×100 + Armor Stone ×100', rewardTh: 'หินอาวุธ ×100 + หินเกราะ ×100', icon: '⚔️', sortOrder: 2 },
  { threshold: 50000, rewardEn: 'Mana ×12,000 + Accessory Stone ×100', rewardTh: 'มานา ×12,000 + หินเครื่องประดับ ×100', icon: '🔮', sortOrder: 3 },
  { threshold: 100000, rewardEn: 'Clothing Ticket ×10', rewardTh: 'ตั๋วเสื้อผ้า ×10', icon: '👗', sortOrder: 4 },
  { threshold: 150000, rewardEn: 'Summon Ticket ×10', rewardTh: 'ตั๋วอัญเชิญ ×10', icon: '✨', sortOrder: 5 },
  { threshold: 200000, rewardEn: 'Fortune House ×1 + Reset Potions ×4', rewardTh: 'บ้านแห่งโชค ×1 + ยารีเซ็ต ×4', icon: '🏠', sortOrder: 6 },
] as const;

const WEAPONS = [
  { name: 'SWORD', sortOrder: 1, visible: true },
  { name: 'BOW', sortOrder: 2, visible: true },
  { name: 'CRYSTAL_ORB', sortOrder: 3, visible: true },
  { name: 'WAND', sortOrder: 4, visible: true },
] as const;

const NEWS_ARTICLES = [
  {
    titleEn: 'Pre-Registration Officially Opens!',
    titleTh: 'เปิดลงทะเบียนล่วงหน้าอย่างเป็นทางการ!',
    slug: 'pre-registration-opens',
    category: 'event',
    emoji: '🎉',
    status: 'published',
    publishedAt: new Date().toISOString(),
  },
  {
    titleEn: 'Discover the Combat System',
    titleTh: 'พบกับระบบการต่อสู้สุดมัน',
    slug: 'combat-system-reveal',
    category: 'update',
    emoji: '⚔️',
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    titleEn: 'Developer Diary: Creating Arcatéa',
    titleTh: 'บันทึกนักพัฒนา: การสร้างอาร์คาเทีย',
    slug: 'developer-diary-arcatea',
    category: 'media',
    emoji: '📖',
    status: 'published',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
  },
] as const;

const STORE_BUTTONS = [
  { platform: 'ios', label: 'App Store', sublabel: 'Pre-order on the', url: '#', sortOrder: 1, visible: true },
  { platform: 'android', label: 'Google Play', sublabel: 'Register on', url: '#', sortOrder: 2, visible: true },
  { platform: 'pc', label: 'Windows', sublabel: 'Coming soon', url: '#', sortOrder: 3, visible: true },
] as const;

const HOMEPAGE_GLOBAL = {
  taglineEn: 'Adventure together, climb higher',
  taglineTh: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
  ctaTextEn: 'Join the pre-registration',
  ctaTextTh: 'ลงทะเบียนล่วงหน้าเลย',
  ctaLink: '/event',
  features: [
    { icon: '⚔️', titleEn: 'Combat System', titleTh: 'ระบบต่อสู้', descriptionEn: 'A four-class combat flow that stays quick to read', descriptionTh: 'ระบบต่อสู้ 4 คลาสที่ดูเข้าใจง่าย แต่ยังมีจังหวะให้เล่นสนุก' },
    { icon: '🗺️', titleEn: 'Explore the World', titleTh: 'สำรวจโลกกว้าง', descriptionEn: 'Travel through Arcatea with routes that stay easy to follow', descriptionTh: 'ออกสำรวจ Arcatea ผ่านเส้นทางที่ตามได้ง่ายและไม่พาหลงทิศ' },
    { icon: '🏰', titleEn: 'Conquer the Tower', titleTh: 'พิชิตหอคอย', descriptionEn: 'Climb The Boundless Spire floor by floor as the challenge tightens', descriptionTh: 'ไต่ The Boundless Spire ไปทีละชั้น ยิ่งสูงยิ่งเข้มข้น' },
    { icon: '✨', titleEn: 'Upgrade Characters', titleTh: 'อัพเกรดตัวละคร', descriptionEn: 'Improve skills, gear, and appearance with a clearer upgrade path', descriptionTh: 'พัฒนาสกิล อุปกรณ์ และรูปลักษณ์ในเส้นทางอัปเกรดที่ดูง่ายขึ้น' },
    { icon: '🏟️', titleEn: 'PvP Arena', titleTh: 'PvP Arena', descriptionEn: 'Step into real-time arena matches against other players', descriptionTh: 'ลงสนาม PvP แบบเรียลไทม์กับผู้เล่นคนอื่น' },
    { icon: '🤝', titleEn: 'Guilds & Friends', titleTh: 'กิลด์ & เพื่อน', descriptionEn: 'Team up with friends and guildmates for bosses and shared goals', descriptionTh: 'ร่วมทีมกับเพื่อนและสมาชิกกิลด์เพื่อจัดการบอสและเป้าหมายร่วมกัน' },
  ],
} as const;

const SITE_SETTINGS_GLOBAL = {
  siteName: 'Eternal Tower Saga',
  siteDescription: 'Eternal Tower Saga — เว็บไซต์ทางการสำหรับข่าวสาร แนะนำเกม และข้อมูลการลงทะเบียนล่วงหน้า',
  socialLinks: {
    facebook: 'https://facebook.com/EternalTowerSaga',
    tiktok: 'https://tiktok.com/@EternalTowerSaga',
    youtube: 'https://youtube.com/@EternalTowerSaga',
    discord: 'https://discord.gg/eternaltowersaga',
  },
  footer: {
    copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
    termsUrl: '/terms',
    privacyUrl: '/privacy',
    supportUrl: '#',
  },
} as const;

const EVENT_CONFIG_GLOBAL = {
  enabled: true,
  titleEn: 'Join the pre-registration',
  titleTh: 'ลงทะเบียนล่วงหน้า',
  descriptionEn: 'Register early for launch rewards and milestone tracking.',
  descriptionTh: 'ลงทะเบียนเลยเพื่อรับรางวัลสุดพิเศษเมื่อเปิดตัว!',
  countdownTarget: '2026-04-02T23:59:59.000Z',
  registrationOpen: true,
} as const;

const FAQ_PAGE_GLOBAL = {
  titleEn: 'Frequently Asked Questions',
  titleTh: 'คำถามที่พบบ่อย',
  faqItems: [
    { questionEn: 'What genre is Eternal Tower Saga?', questionTh: 'Eternal Tower Saga เป็นเกมแนวอะไร?', answerEn: 'A mobile Casual MMORPG and Action RPG. Explore the Eternal Tower and adventure with other players in a fantasy world.', answerTh: 'เกมมือถือแนว Casual MMORPG ผสม Action RPG สำรวจหอคอยนิรันดร์ และร่วมผจญภัยกับผู้เล่นอื่น ๆ ในโลกแฟนตาซี' },
    { questionEn: 'What devices are supported?', questionTh: 'เกมนี้รองรับมือถือสเปคไหนบ้าง?', answerEn: 'Supports iOS 14+, Android 8.0+, and PC (Windows 10+). Cross-platform play is available using the same account.', answerTh: 'รองรับ iOS 14+, Android 8.0+ และ PC (Windows 10+) สามารถเล่นข้ามแพลตฟอร์มได้โดยใช้บัญชีเดียวกัน' },
    { questionEn: 'Is there a guild system?', questionTh: 'มีระบบกิลด์หรือเล่นกับเพื่อนได้ไหม?', answerEn: 'Yes. There is a full guild system with Guild War, Guild Raid, Chat, and Party features for up to 4 friends.', answerTh: 'มีครับ รองรับระบบกิลด์เต็มรูปแบบ ทั้ง Guild War, Guild Raid, Chat และ Party ร่วมผจญภัยกับเพื่อนได้สูงสุด 4 คน' },
    { questionEn: 'What do I get for pre-registering?', questionTh: 'ลงทะเบียนล่วงหน้าจะได้อะไร?', answerEn: 'You receive milestone rewards such as Gold, Summoning Stones, Premium Tickets, and exclusive event items.', answerTh: 'ได้รับรางวัลสะสมตาม milestone เช่น Gold, Summoning Stones, Premium Tickets และไอเทมพิเศษ รวมถึงของรางวัลเฉพาะกิจกรรม' },
    { questionEn: 'Who developed this game?', questionTh: 'เกมนี้พัฒนาโดยบริษัทอะไร?', answerEn: 'Developed by Ultimate Game Co., Ltd.', answerTh: 'พัฒนาโดย บริษัท อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.)' },
  ],
} as const;

const SUPPORT_PAGE_GLOBAL = {
  badgeEn: 'SUPPORT',
  badgeTh: 'ช่วยเหลือ',
  titleEn: 'Support Center',
  titleTh: 'ศูนย์ช่วยเหลือ',
  subtitleEn: 'Need help? Our team is here for you.',
  subtitleTh: 'มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานพร้อมดูแลคุณ',
  supportEmail: 'support@eternaltowersaga.com',
  channels: [
    { icon: 'mail', titleEn: 'Email Support', titleTh: 'อีเมลซัพพอร์ต', descEn: 'Send questions or report issues via email. Our team responds within 24-48 hours.', descTh: 'ส่งคำถามหรือรายงานปัญหาผ่านอีเมล ทีมงานจะตอบกลับภายใน 24-48 ชั่วโมง', actionLabelEn: 'Send Email', actionLabelTh: 'ส่งอีเมล', actionHref: 'mailto:support@eternaltowersaga.com', external: false },
    { icon: 'message-circle', titleEn: 'Discord Community', titleTh: 'Discord Community', descEn: 'Join our Discord community. Chat with other players and the dev team.', descTh: 'เข้าร่วมชุมชน Discord ของเรา พูดคุยกับผู้เล่นและทีมงาน', actionLabelEn: 'Join Discord', actionLabelTh: 'เข้าร่วม Discord', actionHref: 'https://discord.gg/eternaltowersaga', external: true },
    { icon: 'file-question', titleEn: 'FAQ', titleTh: 'คำถามที่พบบ่อย', descEn: 'Find answers to popular questions about the game.', descTh: 'ค้นหาคำตอบสำหรับคำถามยอดนิยมเกี่ยวกับเกม', actionLabelEn: 'View FAQ', actionLabelTh: 'ดู FAQ', actionHref: '/faq', external: false },
    { icon: 'book-open', titleEn: 'Game Guide', titleTh: 'คู่มือเกม', descEn: 'Learn game systems from basics to advanced content.', descTh: 'เรียนรู้ระบบต่าง ๆ ในเกม ตั้งแต่พื้นฐานไปจนถึงเนื้อหาขั้นสูง', actionLabelEn: 'Read Guide', actionLabelTh: 'อ่านคู่มือ', actionHref: '/game-guide', external: false },
  ],
  infoItems: [
    { icon: 'clock', titleEn: 'Response Time', titleTh: 'เวลาตอบกลับ', descEn: 'Within 24-48 business hours', descTh: 'ภายใน 24-48 ชั่วโมงทำการ' },
    { icon: 'shield', titleEn: 'Account Security', titleTh: 'ความปลอดภัย', descEn: 'Never share your password', descTh: 'อย่าแชร์รหัสผ่านกับผู้อื่น' },
    { icon: 'headphones', titleEn: 'Languages', titleTh: 'ภาษาที่รองรับ', descEn: 'Thai / English', descTh: 'ไทย / English' },
  ],
} as const;

async function createIfMissing(
  payload: Payload,
  collection: string,
  data: SeedRecord,
) {
  try {
    await payload.create({ collection, data });
    return true;
  } catch {
    return false;
  }
}

async function seedCollectionEntries(
  payload: Payload,
  label: string,
  collection: string,
  entries: readonly SeedRecord[],
) {
  console.log(label);

  for (const entry of entries) {
    await createIfMissing(payload, collection, entry as SeedRecord);
  }

  console.log(`   ✅ ${entries.length} ${collection} seeded`);
}

async function updateGlobalWithLog(
  payload: Payload,
  label: string,
  slug: string,
  data: SeedRecord,
) {
  console.log(label);

  try {
    await payload.updateGlobal({ slug, data });
    console.log(`   ✅ ${slug} set`);
  } catch (error) {
    console.log(`   ⚠️  ${slug} update error:`, error);
  }
}

async function seedAdmin(payload: Payload) {
  console.log('👤 Creating admin user...');

  const created = await createIfMissing(payload, 'users', ADMIN_USER as unknown as SeedRecord);
  console.log(created ? '   ✅ Admin user created' : '   ⏭️  Admin user already exists');
}

async function seedMilestones(payload: Payload) {
  await seedCollectionEntries(payload, '🏆 Seeding milestones...', 'milestones', MILESTONES as unknown as SeedRecord[]);
}

async function seedWeapons(payload: Payload) {
  await seedCollectionEntries(payload, '🗡️ Seeding weapons...', 'weapons', WEAPONS as unknown as SeedRecord[]);
}

async function seedNews(payload: Payload) {
  await seedCollectionEntries(payload, '📰 Seeding news...', 'news', NEWS_ARTICLES as unknown as SeedRecord[]);
}

async function seedStoreButtons(payload: Payload) {
  await seedCollectionEntries(payload, '🏪 Seeding store buttons...', 'store-buttons', STORE_BUTTONS as unknown as SeedRecord[]);
}

async function seedHomepage(payload: Payload) {
  await updateGlobalWithLog(payload, '🖼️  Setting hero section globals...', 'homepage', HOMEPAGE_GLOBAL as unknown as SeedRecord);
}

async function seedSiteSettings(payload: Payload) {
  await updateGlobalWithLog(payload, '⚙️  Setting site settings...', 'site-settings', SITE_SETTINGS_GLOBAL as unknown as SeedRecord);
}

async function seedEventConfig(payload: Payload) {
  await updateGlobalWithLog(payload, '🎮 Setting event config...', 'event-config', EVENT_CONFIG_GLOBAL as unknown as SeedRecord);
}

async function runSeedSteps(payload: Payload) {
  await seedAdmin(payload);
  await seedMilestones(payload);
  await seedWeapons(payload);
  await seedNews(payload);
  await seedStoreButtons(payload);
  await seedHomepage(payload);
  await seedSiteSettings(payload);
  await seedEventConfig(payload);
  await updateGlobalWithLog(payload, '❓ Setting FAQ page...', 'faq-page', FAQ_PAGE_GLOBAL as unknown as SeedRecord);
  await updateGlobalWithLog(payload, '🛠️  Setting support page...', 'support-page', SUPPORT_PAGE_GLOBAL as unknown as SeedRecord);
}

function printCompletionMessage() {
  console.log('\n✅ Seed complete! Login at /admin with:');
  console.log('   Email: admin@eternaltowersaga.com');
  console.log('   Password: Admin@EST2026!');
}

async function seed() {
  console.log('🌱 Seeding Payload CMS database...\n');
  const payload = await getPayload({ config });
  await runSeedSteps(payload);
  printCompletionMessage();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
