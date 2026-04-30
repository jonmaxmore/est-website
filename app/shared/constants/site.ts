/**
 * Site-wide constants
 *
 * ⚠️ ห้าม hardcode domain ที่ยังไม่ได้จดทะเบียน — โดเมนจริงจะมาจาก
 * NUXT_PUBLIC_SITE_URL (env var) ผ่าน useRuntimeConfig() ในระดับ runtime
 *
 * SITE.email และ SITE.domain ใช้ค่า "tbd" จนกว่าโดเมนจริงจะพร้อม
 * Components ที่ต้องการ siteUrl จริง ให้ดึงจาก runtimeConfig.public.siteUrl
 * ไม่ใช่จากที่นี่
 */
export const SITE = {
  name: 'Eternal Tower Saga',
  nameTh: 'เกม RPG บนมือถือ',
  tagline: 'Adventure together, climb higher.',
  taglineTh: 'ผจญภัยร่วมกัน ปีนหอคอยให้สูงขึ้น',
  /** placeholder until domain is registered — use runtimeConfig.public.siteUrl at runtime */
  domain: 'tbd.example',
  /** placeholder until domain is registered */
  email: 'support@tbd.example',
  copyright: `© ${new Date().getFullYear()} Eternal Tower Saga. All rights reserved.`,
} as const

/**
 * Social links — เปลี่ยนเป็น real URLs เมื่อช่องทางพร้อม
 * ตอนนี้ใส่เป็น placeholder ที่ admin จะ override ผ่าน /admin/integrations
 */
export const SOCIAL_LINKS = {
  facebook: '',
  twitter: '',
  youtube: '',
  discord: '',
  line: '',
} as const
