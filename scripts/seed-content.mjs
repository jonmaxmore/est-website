/**
 * Content Team Seed Script
 * Creates production-quality game content through Admin API endpoints
 * This tests the full backend CRUD pipeline (admin-auth → handler → Prisma → PostgreSQL)
 */

const BASE = process.env.SEED_BASE_URL || 'http://127.0.0.1:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
let cookie = ''

async function login() {
  if (!ADMIN_PASSWORD) {
    console.error('ERROR: Set ADMIN_PASSWORD environment variable before running this script.')
    process.exit(1)
  }
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const setCookie = res.headers.get('set-cookie')
  if (setCookie) cookie = setCookie.split(';')[0]
  const data = await res.json()
  console.log('✓ Login:', data.user?.displayName || 'OK')
}

async function adminFetch(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`)
  return data
}

async function createWeapons() {
  console.log('\n═══ Creating Weapons ═══')
  const weapons = [
    { name: 'ดาบศักดิ์สิทธิ์', nameEn: 'Sacred Sword', descriptionEn: 'A balanced weapon of ancient origin. Masters of the sword combine swift strikes with defensive techniques to dominate the battlefield.', descriptionTh: 'อาวุธสมดุลจากยุคโบราณ ผู้เชี่ยวชาญดาบผสมผสานการโจมตีรวดเร็วกับเทคนิคป้องกันเพื่อครองสนามรบ', statSTR: 75, statINT: 30, statAGI: 60, statDEX: 55, statHP: 70, sortOrder: 0 },
    { name: 'ธนูสายฟ้า', nameEn: 'Thunder Bow', descriptionEn: 'Strike from afar with deadly precision. Archers rain destruction upon enemies before they can close the distance.', descriptionTh: 'โจมตีจากระยะไกลด้วยความแม่นยำอันร้ายแรง นักธนูสาดความหายนะใส่ศัตรูก่อนที่พวกเขาจะเข้าใกล้ได้', statSTR: 40, statINT: 35, statAGI: 85, statDEX: 90, statHP: 45, sortOrder: 1 },
    { name: 'คทาแห่งจันทรา', nameEn: 'Lunar Staff', descriptionEn: 'Channel the arcane forces of the cosmos. Mages unleash devastating area spells that reshape the tide of battle.', descriptionTh: 'ใช้พลังลึกลับจากจักรวาล จอมเวทย์ปล่อยเวทมนตร์พื้นที่อันทรงพลังเพื่อเปลี่ยนกระแสการต่อสู้', statSTR: 20, statINT: 95, statAGI: 40, statDEX: 60, statHP: 35, sortOrder: 2 },
    { name: 'กริชเงา', nameEn: 'Shadow Dagger', descriptionEn: 'Strike from the shadows with lethal speed. Assassins exploit weaknesses for massive critical damage and swift eliminations.', descriptionTh: 'โจมตีจากเงามืดด้วยความเร็วสังหาร นักฆ่าใช้ประโยชน์จากจุดอ่อนเพื่อสร้างดาเมจวิกฤตมหาศาล', statSTR: 55, statINT: 25, statAGI: 95, statDEX: 80, statHP: 30, sortOrder: 3 },
    { name: 'โล่อมตะ', nameEn: 'Immortal Shield', descriptionEn: 'The unbreakable wall that protects allies. Guardians absorb tremendous damage while disrupting enemy formations.', descriptionTh: 'กำแพงที่ไม่อาจทำลายได้ซึ่งปกป้องพันธมิตร ผู้พิทักษ์รับดาเมจมหาศาลพร้อมทำลายรูปแบบของศัตรู', statSTR: 60, statINT: 40, statAGI: 25, statDEX: 30, statHP: 95, sortOrder: 4 },
  ]
  for (const w of weapons) {
    try {
      const result = await adminFetch('/api/admin/weapons', 'POST', w)
      console.log(`  ✓ Weapon: ${w.nameEn} (ID: ${result.id})`)
    } catch (e) { console.log(`  ✗ Weapon ${w.nameEn}: ${e.message}`) }
  }
}

async function createFeatures() {
  console.log('\n═══ Creating Features ═══')
  const features = [
    { key: 'openWorld', titleEn: 'Vast Open World', titleTh: 'โลกเปิดกว้างใหญ่', descriptionEn: 'Explore a breathtaking fantasy realm spanning continents, floating islands, and hidden dungeons.', descriptionTh: 'สำรวจดินแดนแฟนตาซีอันน่าทึ่งที่ครอบคลุมทวีป เกาะลอยฟ้า และดันเจี้ยนที่ซ่อนอยู่', detailEn: 'The world of Eternal Tower Saga features over 200 unique zones across 5 continents. Each area has its own ecosystem, weather patterns, and dynamic events. From the scorching deserts of Ashara to the frozen peaks of Nordheim, every region tells a story waiting to be discovered. Hidden pathways lead to secret dungeons filled with legendary treasures.', detailTh: 'โลกของ Eternal Tower Saga ประกอบด้วยโซนที่ไม่ซ้ำกันกว่า 200 โซนใน 5 ทวีป แต่ละพื้นที่มีระบบนิเวศ สภาพอากาศ และเหตุการณ์พลวัตเป็นของตัวเอง ตั้งแต่ทะเลทรายร้อนระอุของอาชาราไปจนถึงยอดเขาน้ำแข็งของนอร์ดไฮม์ ทุกภูมิภาคมีเรื่องราวรอให้คุณค้นพบ', icon: '⭐' },
    { key: 'pvpArena', titleEn: 'Real-Time PvP Arena', titleTh: 'อารีน่า PvP แบบเรียลไทม์', descriptionEn: 'Compete in ranked matches, guild wars, and seasonal tournaments with skill-based combat.', descriptionTh: 'แข่งขันในแมตช์จัดอันดับ สงครามกิลด์ และทัวร์นาเมนต์ประจำฤดูกาลด้วยการต่อสู้เน้นทักษะ', detailEn: 'Our PvP system features 1v1 duels, 3v3 skirmishes, 15v15 battlegrounds, and massive 50v50 guild sieges. The ranking system has 8 tiers from Bronze to Mythic, with seasonal rewards including exclusive mounts, costumes, and legendary weapons.', detailTh: 'ระบบ PvP ของเรามีทั้งดวล 1v1, ปะทะ 3v3, สนามรบ 15v15 และการล้อมเมืองกิลด์ขนาด 50v50 ระบบจัดอันดับมี 8 ระดับตั้งแต่บรอนซ์ถึงมิทิค พร้อมรางวัลประจำฤดูกาลรวมถึงพาหนะ ชุด และอาวุธในตำนานพิเศษ', icon: '⚔️' },
    { key: 'guildSystem', titleEn: 'Epic Guild Wars', titleTh: 'สงครามกิลด์สุดมหากาพย์', descriptionEn: 'Build your guild, forge alliances, and conquer territories in massive multiplayer battles.', descriptionTh: 'สร้างกิลด์ของคุณ สร้างพันธมิตร และพิชิตดินแดนในการต่อสู้ผู้เล่นหลายคนขนาดใหญ่', detailEn: 'Form or join a guild of up to 100 members. Participate in weekly Guild Wars for territory control, access exclusive Guild Dungeons, and unlock powerful Guild Skills that benefit all members.', detailTh: 'ตั้งหรือเข้าร่วมกิลด์ที่มีสมาชิกสูงสุด 100 คน เข้าร่วมสงครามกิลด์ประจำสัปดาห์เพื่อควบคุมดินแดน เข้าถึงดันเจี้ยนกิลด์พิเศษ และปลดล็อกทักษะกิลด์ที่ทรงพลัง', icon: '🏰' },
    { key: 'craftingSystem', titleEn: 'Deep Crafting System', titleTh: 'ระบบคราฟท์เชิงลึก', descriptionEn: 'Gather rare materials, master professions, and craft legendary equipment with unique abilities.', descriptionTh: 'รวบรวมวัตถุดิบหายาก เชี่ยวชาญอาชีพ และคราฟท์อุปกรณ์ในตำนานพร้อมความสามารถพิเศษ', detailEn: 'Choose from 8 crafting professions including Blacksmithing, Alchemy, Enchanting, and Runecarving. Discover over 500 unique recipes and create gear that rivals raid drops.', detailTh: 'เลือกจาก 8 อาชีพคราฟท์รวมถึงช่างตีเหล็ก นักเล่นแร่แปรธาตุ นักเสกมนต์ และนักแกะรูน ค้นพบสูตรที่ไม่ซ้ำกันกว่า 500 สูตรและสร้างอุปกรณ์ที่เทียบเท่ากับของดรอปจากเรด', icon: '🔨' },
    { key: 'dungeonRaids', titleEn: 'Challenging Dungeon Raids', titleTh: 'เรดดันเจี้ยนสุดท้าทาย', descriptionEn: 'Team up with friends to conquer multi-phase boss fights in epic dungeon raids.', descriptionTh: 'ร่วมทีมกับเพื่อนเพื่อพิชิตบอสหลายเฟสในเรดดันเจี้ยนสุดมหากาพย์', detailEn: 'Take on 12 unique dungeons with Normal, Heroic, and Mythic difficulty modes. Each raid features complex boss mechanics requiring coordination between tank, DPS, and healer roles.', detailTh: 'ท้าท้าย 12 ดันเจี้ยนที่ไม่ซ้ำกันในโหมดความยาก ปกติ ฮีโร่อิค และมิทิค แต่ละเรดมีกลไกบอสที่ซับซ้อนซึ่งต้องการการประสานงานระหว่างแทงค์ DPS และฮีลเลอร์', icon: '🐉' },
    { key: 'petSystem', titleEn: 'Companion Pet System', titleTh: 'ระบบสัตว์เลี้ยงคู่ใจ', descriptionEn: 'Collect, raise, and evolve over 100 unique pets that fight alongside you in battle.', descriptionTh: 'สะสม เลี้ยงดู และวิวัฒนาการสัตว์เลี้ยงที่ไม่ซ้ำกันกว่า 100 ตัวที่ต่อสู้เคียงข้างคุณในสนามรบ', detailEn: 'Discover pets across the world — from fire drakes to crystal golems. Each pet has unique abilities, evolution paths, and gear slots. Max-level pets unlock powerful Ultimate skills.', detailTh: 'ค้นพบสัตว์เลี้ยงทั่วโลก ตั้งแต่มังกรไฟไปจนถึงโกเลมคริสตัล สัตว์เลี้ยงแต่ละตัวมีความสามารถพิเศษ เส้นทางวิวัฒนาการ และช่องอุปกรณ์ สัตว์เลี้ยงเลเวลสูงสุดปลดล็อกทักษะ Ultimate ที่ทรงพลัง', icon: '🦊' },
  ]
  for (const f of features) {
    try {
      const result = await adminFetch('/api/admin/features', 'POST', { ...f, visible: true, sortOrder: features.indexOf(f) })
      console.log(`  ✓ Feature: ${f.titleEn} (ID: ${result.id})`)
    } catch (e) { console.log(`  ✗ Feature ${f.titleEn}: ${e.message}`) }
  }
}

async function createHighlights() {
  console.log('\n═══ Creating Highlights ═══')
  const highlights = [
    { key: 'graphics', titleEn: 'Next-Gen Graphics', titleTh: 'กราฟิกระดับเน็กซ์เจน', descriptionEn: 'Experience breathtaking visuals powered by cutting-edge mobile rendering technology.', descriptionTh: 'สัมผัสภาพที่น่าทึ่งด้วยเทคโนโลยีเรนเดอร์มือถือล่าสุด', detailEn: 'Built on a custom engine optimized for mobile, featuring real-time global illumination, volumetric fog, and physically-based materials that bring the fantasy world to life.', detailTh: 'สร้างบนเอนจินที่ปรับแต่งเฉพาะสำหรับมือถือ พร้อมระบบแสงทั่วโลกแบบเรียลไทม์ หมอกเชิงปริมาตร และวัสดุตามกายภาพที่ทำให้โลกแฟนตาซีมีชีวิต', icon: '✨' },
    { key: 'crossPlatform', titleEn: 'Cross-Platform Play', titleTh: 'เล่นข้ามแพลตฟอร์ม', descriptionEn: 'Play seamlessly across iOS, Android, and PC with full cross-save support.', descriptionTh: 'เล่นได้อย่างราบรื่นข้าม iOS, Android และ PC พร้อมระบบบันทึกข้ามแพลตฟอร์มเต็มรูปแบบ', detailEn: 'Your adventure continues wherever you go. Start a raid on PC during lunch, continue your quests on mobile during commute, and join guild wars on tablet at home.', detailTh: 'การผจญภัยของคุณดำเนินต่อไปทุกที่ที่คุณไป เริ่มเรดบน PC ตอนพักเที่ยง ทำเควสต่อบนมือถือระหว่างเดินทาง และเข้าร่วมสงครามกิลด์บนแท็บเล็ตที่บ้าน', icon: '🌐' },
    { key: 'communityEvents', titleEn: 'Live Community Events', titleTh: 'อีเวนต์ชุมชนสด', descriptionEn: 'Weekly world events, seasonal festivals, and community-driven content updates.', descriptionTh: 'อีเวนต์โลกประจำสัปดาห์ เทศกาลประจำฤดูกาล และอัปเดตเนื้อหาจากชุมชน', detailEn: 'Join thousands of players in massive world events like Dragon Invasions, Tower Ascension races, and seasonal celebrations. Community polls decide future content direction.', detailTh: 'ร่วมกับผู้เล่นนับพันในอีเวนต์โลกขนาดใหญ่ เช่น การรุกรานมังกร แข่งขันปีนหอคอย และการเฉลิมฉลองประจำฤดูกาล โพลชุมชนตัดสินทิศทางเนื้อหาในอนาคต', icon: '🎉' },
  ]
  for (const h of highlights) {
    try {
      const result = await adminFetch('/api/admin/highlights', 'POST', { ...h, visible: true, sortOrder: highlights.indexOf(h) })
      console.log(`  ✓ Highlight: ${h.titleEn} (ID: ${result.id})`)
    } catch (e) { console.log(`  ✗ Highlight ${h.titleEn}: ${e.message}`) }
  }
}

async function createNews() {
  console.log('\n═══ Creating News ═══')
  const news = [
    {
      slug: 'eternal-tower-saga-global-launch',
      titleEn: 'Eternal Tower Saga — Global Launch Announcement',
      titleTh: 'Eternal Tower Saga — ประกาศเปิดให้บริการทั่วโลก',
      excerptEn: 'The wait is over! Eternal Tower Saga officially launches worldwide on all platforms.',
      excerptTh: 'การรอคอยสิ้นสุดลงแล้ว! Eternal Tower Saga เปิดให้บริการอย่างเป็นทางการทั่วโลกบนทุกแพลตฟอร์ม',
      contentEn: '<h2>The Gates of the Eternal Tower Are Now Open</h2><p>After years of development and extensive beta testing with over 500,000 players, we are thrilled to announce that Eternal Tower Saga is now available worldwide.</p><h3>Launch Features</h3><ul><li>5 Weapon Classes with unique playstyles</li><li>200+ explorable zones across 5 continents</li><li>12 challenging dungeons with 3 difficulty modes</li><li>Full cross-platform support (iOS, Android, PC)</li></ul><p>Download now and begin your ascent!</p>',
      contentTh: '<h2>ประตูแห่งหอคอยนิรันดร์เปิดแล้ว</h2><p>หลังจากการพัฒนาหลายปีและการทดสอบเบต้าอย่างกว้างขวางกับผู้เล่นกว่า 500,000 คน เรามีความยินดีที่จะประกาศว่า Eternal Tower Saga พร้อมให้บริการทั่วโลกแล้ว</p>',
      category: 'ANNOUNCEMENT',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      featureOnHome: true,
      homePriority: 1,
    },
    {
      slug: 'patch-1-1-new-dungeon',
      titleEn: 'Patch 1.1 — The Abyssal Sanctum',
      titleTh: 'แพทช์ 1.1 — วิหารแห่งเหวลึก',
      excerptEn: 'A new mythic-tier dungeon awaits brave adventurers. Face the Abyssal Guardian and claim legendary rewards.',
      excerptTh: 'ดันเจี้ยนระดับมิทิคใหม่รอนักผจญภัยผู้กล้าหาญ เผชิญหน้ากับผู้พิทักษ์แห่งเหวลึกและรับรางวัลในตำนาน',
      contentEn: '<h2>New Content Update</h2><p>Patch 1.1 brings the most challenging dungeon yet — The Abyssal Sanctum. This 10-player raid features 4 unique bosses and a final encounter that will test even the most seasoned guilds.</p>',
      contentTh: '<h2>อัปเดตเนื้อหาใหม่</h2><p>แพทช์ 1.1 นำเสนอดันเจี้ยนที่ท้าทายที่สุด — วิหารแห่งเหวลึก เรดสำหรับ 10 ผู้เล่นนี้มี 4 บอสที่ไม่ซ้ำกันและการเผชิญหน้าสุดท้ายที่จะทดสอบแม้กิลด์ที่มีประสบการณ์มากที่สุด</p>',
      category: 'UPDATE',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      featureOnHome: true,
      homePriority: 2,
    },
    {
      slug: 'summer-festival-2026',
      titleEn: 'Summer Festival 2026 — Double Rewards Event',
      titleTh: 'เทศกาลฤดูร้อน 2026 — อีเวนต์รางวัลสองเท่า',
      excerptEn: 'Celebrate summer with double EXP, exclusive cosmetics, and a limited-time beach dungeon!',
      excerptTh: 'ฉลองฤดูร้อนกับ EXP สองเท่า ชุดพิเศษ และดันเจี้ยนชายหาดแบบจำกัดเวลา!',
      contentEn: '<h2>Summer is Here!</h2><p>From July 1 to August 31, enjoy double EXP and Gold drops across all dungeons. Complete the Summer Quest line to unlock exclusive beach-themed costumes and the legendary Surfboard mount!</p>',
      contentTh: '<h2>ฤดูร้อนมาถึงแล้ว!</h2><p>ตั้งแต่ 1 กรกฎาคม ถึง 31 สิงหาคม สนุกกับ EXP และทองดรอปสองเท่าในทุกดันเจี้ยน ทำเควสต์ฤดูร้อนให้ครบเพื่อปลดล็อกชุดธีมชายหาดพิเศษและพาหนะกระดานโต้คลื่นในตำนาน!</p>',
      category: 'EVENT',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      featureOnHome: true,
      homePriority: 3,
    },
  ]
  for (const n of news) {
    try {
      const result = await adminFetch('/api/admin/news', 'POST', n)
      console.log(`  ✓ News: ${n.titleEn} (ID: ${result.id})`)
    } catch (e) { console.log(`  ✗ News ${n.slug}: ${e.message}`) }
  }
}

async function createEvents() {
  console.log('\n═══ Creating Events ═══')
  const events = [
    {
      titleEn: 'Pre-Registration Milestone Event', titleTh: 'อีเวนต์เป้าหมายลงทะเบียนล่วงหน้า',
      descriptionEn: 'Reach registration milestones to unlock server-wide launch rewards for all players!',
      descriptionTh: 'บรรลุเป้าหมายการลงทะเบียนเพื่อปลดล็อกรางวัลเปิดเซิร์ฟเวอร์สำหรับผู้เล่นทุกคน!',
      type: 'EVENT', status: 'ACTIVE', visible: true,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 90 * 86400000).toISOString(),
      icon: '🎮', color: '#d4a843',
    },
    {
      titleEn: 'Weekend Hot Time — 2x EXP', titleTh: 'ฮอตไทม์สุดสัปดาห์ — EXP 2 เท่า',
      descriptionEn: 'Double EXP and Gold drops every weekend! Level up faster and gear up for the new raid.',
      descriptionTh: 'EXP และทองดรอปสองเท่าทุกสุดสัปดาห์! เลเวลอัพเร็วขึ้นและเตรียมตัวสำหรับเรดใหม่',
      type: 'HOT_TIME', status: 'SCHEDULED', visible: true,
      startsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      multiplier: 2, bonusType: 'EXP',
      icon: '🔥', color: '#ef4444',
    },
  ]
  for (const e of events) {
    try {
      const result = await adminFetch('/api/admin/events', 'POST', e)
      console.log(`  ✓ Event: ${e.titleEn} (ID: ${result.id})`)
    } catch (err) { console.log(`  ✗ Event ${e.titleEn}: ${err.message}`) }
  }
}

async function createFAQ() {
  console.log('\n═══ Creating FAQ ═══')
  // FAQ is stored as JSON in PageContent
  const faqItems = [
    { questionEn: 'What platforms is Eternal Tower Saga available on?', questionTh: 'Eternal Tower Saga เล่นได้บนแพลตฟอร์มไหนบ้าง?', answerEn: 'Eternal Tower Saga is available on iOS, Android, and PC (Windows) with full cross-platform play and cross-save support.', answerTh: 'Eternal Tower Saga เล่นได้บน iOS, Android และ PC (Windows) พร้อมระบบเล่นข้ามแพลตฟอร์มและบันทึกข้ามแพลตฟอร์มเต็มรูปแบบ', visible: true },
    { questionEn: 'Is the game free to play?', questionTh: 'เกมนี้เล่นฟรีหรือไม่?', answerEn: 'Yes! Eternal Tower Saga is completely free to download and play. Optional cosmetic purchases are available but do not affect gameplay.', answerTh: 'ใช่! Eternal Tower Saga ดาวน์โหลดและเล่นฟรีทั้งหมด มีการซื้อเครื่องสำอางเสริมแต่ไม่ส่งผลต่อการเล่นเกม', visible: true },
    { questionEn: 'What are the minimum system requirements?', questionTh: 'ความต้องการระบบขั้นต่ำคืออะไร?', answerEn: 'iOS 14+ / Android 10+ with 3GB RAM. PC: Windows 10, Intel i5, 8GB RAM, GTX 1050.', answerTh: 'iOS 14+ / Android 10+ พร้อม RAM 3GB PC: Windows 10, Intel i5, RAM 8GB, GTX 1050', visible: true },
    { questionEn: 'How do I contact support?', questionTh: 'จะติดต่อฝ่ายสนับสนุนได้อย่างไร?', answerEn: 'You can reach our support team via the in-game Help Center, email at support@eternaltowersaga.com, or through our official Discord server.', answerTh: 'คุณสามารถติดต่อทีมสนับสนุนผ่านศูนย์ช่วยเหลือในเกม อีเมลที่ support@eternaltowersaga.com หรือผ่านเซิร์ฟเวอร์ Discord อย่างเป็นทางการ', visible: true },
    { questionEn: 'When does the next season start?', questionTh: 'ฤดูกาลถัดไปเริ่มเมื่อไร?', answerEn: 'Competitive seasons run for 3 months. The next season begins at the start of each quarter with new rewards and balance changes.', answerTh: 'ฤดูกาลการแข่งขันดำเนินไป 3 เดือน ฤดูกาลถัดไปเริ่มต้นในแต่ละไตรมาสพร้อมรางวัลใหม่และการปรับสมดุล', visible: true },
  ]
  try {
    await adminFetch('/api/admin/pages/faq', 'PUT', {
      titleEn: 'Frequently Asked Questions',
      titleTh: 'คำถามที่พบบ่อย',
      contentEn: JSON.stringify(faqItems),
      contentTh: JSON.stringify(faqItems),
      status: 'PUBLISHED',
    })
    console.log(`  ✓ FAQ: ${faqItems.length} items created`)
  } catch (e) { console.log(`  ⚠ FAQ: ${e.message}`) }
}

async function main() {
  console.log('╔════════════════════════════════════════╗')
  console.log('║  AI Content Team — Seeding Admin Data  ║')
  console.log('╚════════════════════════════════════════╝')

  await login()
  await createWeapons()
  await createFeatures()
  await createHighlights()
  await createNews()
  await createEvents()
  await createFAQ()

  console.log('\n═══ Verification ═══')
  const weapons = await adminFetch('/api/admin/weapons')
  const features = await adminFetch('/api/admin/features')
  const highlights = await adminFetch('/api/admin/highlights')
  const news = await adminFetch('/api/admin/news')
  const events = await adminFetch('/api/admin/events')

  console.log(`  Weapons:    ${weapons.length} records`)
  console.log(`  Features:   ${features.length} records`)
  console.log(`  Highlights: ${highlights.length} records`)
  console.log(`  News:       ${Array.isArray(news) ? news.length : news.data?.length || 0} records`)
  console.log(`  Events:     ${events.length} records`)
  console.log('\n✅ Content Team mission complete!')
}

main().catch(console.error)
