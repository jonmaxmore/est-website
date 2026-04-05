import type { CMSFooterGroup, CMSFooterSettings, CMSNavLink } from '@/types/cms'

export const DEFAULT_REGISTRATION_URL = '/event'

export const DEFAULT_NAVIGATION_LINKS: CMSNavLink[] = []
export const DEFAULT_FOOTER_GROUPS: CMSFooterGroup[] = []

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
