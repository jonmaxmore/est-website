import type { CMSFooterGroup, CMSFooterSettings, CMSNavLink } from '@/types/cms'

export const DEFAULT_REGISTRATION_URL = '/event'

export const DEFAULT_NAVIGATION_LINKS: CMSNavLink[] = [
  { id: 'hero', labelTh: 'หน้าหลัก', labelEn: 'Home', href: '/', sectionId: 'hero', visible: true },
  { id: 'weapons', labelTh: 'อาวุธ', labelEn: 'Weapons', href: '/#weapons', sectionId: 'weapons', visible: true },
  { id: 'features', labelTh: 'ไฮไลท์', labelEn: 'Highlights', href: '/game-guide', sectionId: 'features', visible: true },
  { id: 'news', labelTh: 'ข่าวสาร', labelEn: 'News', href: '/news', sectionId: 'news', visible: true },
]

export const DEFAULT_FOOTER_GROUPS: CMSFooterGroup[] = [
  {
    titleTh: 'สำรวจ',
    titleEn: 'Explore',
    links: [
      { labelTh: 'หน้าหลัก', labelEn: 'Home', href: '/' },
      { labelTh: 'อาวุธ', labelEn: 'Weapons', href: '/#weapons' },
      { labelTh: 'ไฮไลท์เกม', labelEn: 'Highlights', href: '/game-guide' },
      { labelTh: 'ข่าวสาร', labelEn: 'News', href: '/news' },
    ],
  },
  {
    titleTh: 'ช่วยเหลือ',
    titleEn: 'Support',
    links: [
      { labelTh: 'ข้อกำหนดการใช้งาน', labelEn: 'Terms of Service', href: '/terms' },
      { labelTh: 'นโยบายความเป็นส่วนตัว', labelEn: 'Privacy Policy', href: '/privacy' },
      { labelTh: 'คำถามที่พบบ่อย', labelEn: 'FAQ', href: '/faq' },
    ],
  },
  {
    titleTh: 'ชุมชน',
    titleEn: 'Community',
    descriptionTh: 'ติดตามข่าว กิจกรรม และความเคลื่อนไหวล่าสุดของ Eternal Tower Saga ผ่านช่องทาง community หลักของเกมได้ที่นี่',
    descriptionEn: 'News, events, and day-to-day updates from the official community channels.',
    links: [
      { labelTh: 'ลงทะเบียนล่วงหน้า', labelEn: 'Pre-register', href: '/event' },
      { labelTh: 'ดาวน์โหลด', labelEn: 'Download', href: '/download' },
    ],
  },
]

export const DEFAULT_FOOTER: CMSFooterSettings = {
  copyrightText: '© 2026 Eternal Tower Saga. All rights reserved.',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  supportUrl: '#',
  brandCopyTh: 'Eternal Tower Saga คือเกมผจญภัยแฟนตาซีที่ชวนเล่นกับเพื่อน เข้าใจระบบได้ไม่ยาก และมีโลกที่ค่อย ๆ เปิดให้สำรวจมากขึ้นทุกครั้งที่กลับมา',
  brandCopyEn: 'A fantasy RPG you play with friends. Systems that stay readable, and a world that opens up the longer you stick around.',
  platformsLabelTh: 'พร้อมบน iOS • Android • PC',
  platformsLabelEn: 'Available on iOS • Android • PC',
  groups: DEFAULT_FOOTER_GROUPS,
}
