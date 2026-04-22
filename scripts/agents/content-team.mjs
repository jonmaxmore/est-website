/**
 * AI Content Team — Seeds production content via Admin API
 * Tests every admin module: Weapons, Features, Highlights, News, Events, FAQ
 */
import { adminFetch, record } from './utils.mjs'

export async function runContentTeam() {
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║  CONTENT TEAM — Seeding via Admin Tools  ║')
  console.log('╚══════════════════════════════════════════╝')

  // ── CLEANUP existing data ──
  console.log('\n── Phase 0: Cleanup Old Data ──')
  for (const mod of ['weapons', 'features', 'highlights', 'news', 'events']) {
    const { ok, data } = await adminFetch(`/api/admin/${mod}`)
    if (ok && Array.isArray(data)) {
      for (const item of data) {
        const id = item.id
        await adminFetch(`/api/admin/${mod}/${id}`, 'DELETE')
      }
      console.log(`  🗑️ Cleared ${data.length} ${mod}`)
    } else if (ok && data?.data) {
      for (const item of data.data) {
        await adminFetch(`/api/admin/${mod}/${item.id}`, 'DELETE')
      }
      console.log(`  🗑️ Cleared ${data.data.length} ${mod}`)
    }
  }

  // ── WEAPONS ──
  console.log('\n── Creating Weapons ──')
  const weapons = [
    { name: 'ดาบศักดิ์สิทธิ์', nameEn: 'Sacred Sword', descriptionEn: 'A balanced weapon of ancient origin combining swift strikes with defensive techniques.', descriptionTh: 'อาวุธสมดุลจากยุคโบราณ ผสมผสานการโจมตีรวดเร็วกับเทคนิคป้องกัน', statSTR: 75, statINT: 30, statAGI: 60, statDEX: 55, statHP: 70, sortOrder: 0 },
    { name: 'ธนูสายฟ้า', nameEn: 'Thunder Bow', descriptionEn: 'Strike from afar with deadly precision. Rain destruction before enemies close the distance.', descriptionTh: 'โจมตีจากระยะไกลด้วยความแม่นยำอันร้ายแรง', statSTR: 40, statINT: 35, statAGI: 85, statDEX: 90, statHP: 45, sortOrder: 1 },
    { name: 'คทาแห่งจันทรา', nameEn: 'Lunar Staff', descriptionEn: 'Channel arcane forces of the cosmos. Unleash devastating area spells.', descriptionTh: 'ใช้พลังลึกลับจากจักรวาล ปล่อยเวทมนตร์พื้นที่อันทรงพลัง', statSTR: 20, statINT: 95, statAGI: 40, statDEX: 60, statHP: 35, sortOrder: 2 },
    { name: 'กริชเงา', nameEn: 'Shadow Dagger', descriptionEn: 'Strike from shadows with lethal speed for massive critical damage.', descriptionTh: 'โจมตีจากเงามืดด้วยความเร็วสังหาร สร้างดาเมจวิกฤตมหาศาล', statSTR: 55, statINT: 25, statAGI: 95, statDEX: 80, statHP: 30, sortOrder: 3 },
    { name: 'โล่อมตะ', nameEn: 'Immortal Shield', descriptionEn: 'The unbreakable wall protecting allies while disrupting enemy formations.', descriptionTh: 'กำแพงที่ไม่อาจทำลายได้ ปกป้องพันธมิตร ทำลายรูปแบบศัตรู', statSTR: 60, statINT: 40, statAGI: 25, statDEX: 30, statHP: 95, sortOrder: 4 },
  ]
  for (const w of weapons) {
    const r = await adminFetch('/api/admin/weapons', 'POST', w)
    record('Content', 'Weapons', `Create ${w.nameEn}`, r.ok, r.ok ? `ID:${r.data.id}` : JSON.stringify(r.data))
  }

  // ── FEATURES ──
  console.log('\n── Creating Features ──')
  const features = [
    { key: 'openWorld', titleEn: 'Vast Open World', titleTh: 'โลกเปิดกว้างใหญ่', descriptionEn: 'Explore a breathtaking fantasy realm spanning continents and hidden dungeons.', descriptionTh: 'สำรวจดินแดนแฟนตาซีอันน่าทึ่งที่ครอบคลุมทวีปและดันเจี้ยนที่ซ่อนอยู่', detailEn: 'Over 200 unique zones across 5 continents with dynamic weather and events.', detailTh: 'กว่า 200 โซนใน 5 ทวีป พร้อมสภาพอากาศและเหตุการณ์พลวัต', icon: '⭐', visible: true, sortOrder: 0 },
    { key: 'pvpArena', titleEn: 'Real-Time PvP Arena', titleTh: 'อารีน่า PvP แบบเรียลไทม์', descriptionEn: 'Compete in ranked matches and guild wars with skill-based combat.', descriptionTh: 'แข่งขันในแมตช์จัดอันดับและสงครามกิลด์ด้วยการต่อสู้เน้นทักษะ', detailEn: '1v1, 3v3, 15v15, and 50v50 guild sieges with 8-tier ranking.', detailTh: 'ดวล 1v1, ปะทะ 3v3, สนามรบ 15v15 และล้อมเมือง 50v50', icon: '⚔️', visible: true, sortOrder: 1 },
    { key: 'guildSystem', titleEn: 'Epic Guild Wars', titleTh: 'สงครามกิลด์สุดมหากาพย์', descriptionEn: 'Build your guild, forge alliances, and conquer territories.', descriptionTh: 'สร้างกิลด์ สร้างพันธมิตร พิชิตดินแดน', detailEn: 'Guilds of 100 members with weekly territory wars and guild dungeons.', detailTh: 'กิลด์สูงสุด 100 คน สงครามดินแดนประจำสัปดาห์', icon: '🏰', visible: true, sortOrder: 2 },
    { key: 'craftingSystem', titleEn: 'Deep Crafting System', titleTh: 'ระบบคราฟท์เชิงลึก', descriptionEn: 'Gather rare materials and craft legendary equipment.', descriptionTh: 'รวบรวมวัตถุดิบหายาก คราฟท์อุปกรณ์ในตำนาน', detailEn: '8 crafting professions with 500+ unique recipes.', detailTh: '8 อาชีพคราฟท์ สูตรกว่า 500 สูตร', icon: '🔨', visible: true, sortOrder: 3 },
    { key: 'dungeonRaids', titleEn: 'Challenging Raids', titleTh: 'เรดสุดท้าทาย', descriptionEn: 'Team up for multi-phase boss fights in epic dungeon raids.', descriptionTh: 'ร่วมทีมพิชิตบอสหลายเฟสในเรดดันเจี้ยนมหากาพย์', detailEn: '12 dungeons with Normal, Heroic, and Mythic modes.', detailTh: '12 ดันเจี้ยน โหมดปกติ ฮีโร่อิค มิทิค', icon: '🐉', visible: true, sortOrder: 4 },
    { key: 'petSystem', titleEn: 'Companion Pets', titleTh: 'ระบบสัตว์เลี้ยงคู่ใจ', descriptionEn: 'Collect over 100 unique pets that fight alongside you.', descriptionTh: 'สะสมสัตว์เลี้ยงกว่า 100 ตัวที่ต่อสู้เคียงข้างคุณ', detailEn: 'Pets with evolution paths, gear slots, and Ultimate skills.', detailTh: 'สัตว์เลี้ยงมีเส้นทางวิวัฒนาการ ช่องอุปกรณ์ และทักษะ Ultimate', icon: '🦊', visible: true, sortOrder: 5 },
  ]
  for (const f of features) {
    const r = await adminFetch('/api/admin/features', 'POST', f)
    record('Content', 'Features', `Create ${f.titleEn}`, r.ok, r.ok ? `ID:${r.data.id}` : JSON.stringify(r.data))
  }

  // ── HIGHLIGHTS ──
  console.log('\n── Creating Highlights ──')
  const highlights = [
    { key: 'graphics', titleEn: 'Next-Gen Graphics', titleTh: 'กราฟิกระดับเน็กซ์เจน', descriptionEn: 'Breathtaking visuals powered by cutting-edge rendering technology.', descriptionTh: 'ภาพสวยงามด้วยเทคโนโลยีเรนเดอร์ล่าสุด', detailEn: 'Real-time global illumination, volumetric fog, and PBR materials.', detailTh: 'แสงทั่วโลกแบบเรียลไทม์ หมอกเชิงปริมาตร และวัสดุตามกายภาพ', icon: '✨', visible: true, sortOrder: 0 },
    { key: 'crossPlatform', titleEn: 'Cross-Platform Play', titleTh: 'เล่นข้ามแพลตฟอร์ม', descriptionEn: 'Play on iOS, Android, and PC with full cross-save.', descriptionTh: 'เล่นได้ทั้ง iOS, Android และ PC พร้อมบันทึกข้ามแพลตฟอร์ม', detailEn: 'Start on PC, continue on mobile — progress syncs everywhere.', detailTh: 'เริ่มบน PC ทำต่อบนมือถือ ข้อมูลซิงค์ทุกที่', icon: '🌐', visible: true, sortOrder: 1 },
    { key: 'communityEvents', titleEn: 'Live Community Events', titleTh: 'อีเวนต์ชุมชนสด', descriptionEn: 'Weekly events, seasonal festivals, and community-driven content.', descriptionTh: 'อีเวนต์ประจำสัปดาห์ เทศกาลประจำฤดูกาล', detailEn: 'Dragon Invasions, Tower races, and seasonal celebrations.', detailTh: 'การรุกรานมังกร แข่งปีนหอคอย และเทศกาลประจำฤดูกาล', icon: '🎉', visible: true, sortOrder: 2 },
  ]
  for (const h of highlights) {
    const r = await adminFetch('/api/admin/highlights', 'POST', h)
    record('Content', 'Highlights', `Create ${h.titleEn}`, r.ok, r.ok ? `ID:${r.data.id}` : JSON.stringify(r.data))
  }

  // ── NEWS ──
  console.log('\n── Creating News ──')
  const news = [
    { slug: 'global-launch-2026', titleEn: 'Global Launch Announcement', titleTh: 'ประกาศเปิดให้บริการทั่วโลก', excerptEn: 'Eternal Tower Saga officially launches worldwide!', excerptTh: 'Eternal Tower Saga เปิดให้บริการอย่างเป็นทางการทั่วโลก!', contentEn: '<h2>The Gates Are Open</h2><p>After years of development, ETS is now available worldwide.</p>', contentTh: '<h2>ประตูเปิดแล้ว</h2><p>หลังจากการพัฒนาหลายปี ETS พร้อมให้บริการทั่วโลกแล้ว</p>', category: 'ANNOUNCEMENT', status: 'PUBLISHED', publishedAt: new Date().toISOString(), featureOnHome: true, homePriority: 1 },
    { slug: 'patch-1-1-abyssal', titleEn: 'Patch 1.1 — The Abyssal Sanctum', titleTh: 'แพทช์ 1.1 — วิหารแห่งเหวลึก', excerptEn: 'A new mythic dungeon with legendary rewards.', excerptTh: 'ดันเจี้ยนมิทิคใหม่พร้อมรางวัลในตำนาน', contentEn: '<h2>New Raid</h2><p>4 unique bosses await.</p>', contentTh: '<h2>เรดใหม่</h2><p>4 บอสรอคุณอยู่</p>', category: 'UPDATE', status: 'PUBLISHED', publishedAt: new Date(Date.now() - 86400000).toISOString(), featureOnHome: true, homePriority: 2 },
    { slug: 'summer-festival-2026', titleEn: 'Summer Festival 2026', titleTh: 'เทศกาลฤดูร้อน 2026', excerptEn: 'Double EXP and exclusive cosmetics!', excerptTh: 'EXP สองเท่าและชุดพิเศษ!', contentEn: '<h2>Summer!</h2><p>Double EXP July-August.</p>', contentTh: '<h2>ฤดูร้อน!</h2><p>EXP สองเท่า ก.ค.-ส.ค.</p>', category: 'EVENT', status: 'PUBLISHED', publishedAt: new Date(Date.now() - 172800000).toISOString(), featureOnHome: true, homePriority: 3 },
  ]
  for (const n of news) {
    const r = await adminFetch('/api/admin/news', 'POST', n)
    record('Content', 'News', `Create ${n.slug}`, r.ok, r.ok ? `ID:${r.data.id}` : JSON.stringify(r.data))
  }

  // ── EVENTS ──
  console.log('\n── Creating Events ──')
  const events = [
    { titleEn: 'Pre-Registration Milestone', titleTh: 'อีเวนต์เป้าหมายลงทะเบียน', descriptionEn: 'Reach milestones to unlock server-wide rewards!', descriptionTh: 'บรรลุเป้าหมายเพื่อปลดล็อกรางวัลเซิร์ฟเวอร์!', type: 'EVENT', status: 'ACTIVE', visible: true, startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 90 * 86400000).toISOString(), icon: '🎮', color: '#d4a843' },
    { titleEn: 'Weekend Hot Time — 2x EXP', titleTh: 'ฮอตไทม์สุดสัปดาห์ — EXP 2 เท่า', descriptionEn: 'Double EXP every weekend!', descriptionTh: 'EXP สองเท่าทุกสุดสัปดาห์!', type: 'HOT_TIME', status: 'SCHEDULED', visible: true, startsAt: new Date(Date.now() + 3 * 86400000).toISOString(), endsAt: new Date(Date.now() + 5 * 86400000).toISOString(), multiplier: 2, bonusType: 'EXP', icon: '🔥', color: '#ef4444' },
  ]
  for (const e of events) {
    const r = await adminFetch('/api/admin/events', 'POST', e)
    record('Content', 'Events', `Create ${e.titleEn}`, r.ok, r.ok ? `ID:${r.data.id}` : JSON.stringify(r.data))
  }

  // ── FAQ ──
  console.log('\n── Creating FAQ ──')
  const faqData = {
    titleEn: 'Frequently Asked Questions', titleTh: 'คำถามที่พบบ่อย',
    contentEn: JSON.stringify([
      { questionEn: 'What platforms?', answerEn: 'iOS, Android, PC with cross-platform.', visible: true },
      { questionEn: 'Free to play?', answerEn: 'Yes, cosmetic only monetization.', visible: true },
      { questionEn: 'Min requirements?', answerEn: 'iOS 14+ / Android 10+ / Win10 i5 8GB.', visible: true },
    ]),
    contentTh: JSON.stringify([
      { questionTh: 'เล่นบนแพลตฟอร์มไหนได้?', answerTh: 'iOS, Android, PC ข้ามแพลตฟอร์ม', visible: true },
      { questionTh: 'เล่นฟรีไหม?', answerTh: 'ฟรี มีแค่เครื่องสำอาง', visible: true },
    ]),
    status: 'PUBLISHED',
  }
  const faqR = await adminFetch('/api/admin/pages/faq', 'PUT', faqData)
  record('Content', 'FAQ', 'Create FAQ page', faqR.ok, faqR.ok ? 'saved' : JSON.stringify(faqR.data))

  console.log('\n✅ Content Team complete')
}
