/**
 * ═══ Nuxt Configuration ═══
 * ไฟล์ตั้งค่าหลักของแอป — ทุกอย่างเริ่มจากที่นี่
 * - modules: ปลั๊กอินที่ใช้ (UI, i18n, auth, motion)
 * - runtimeConfig: ค่า secret ที่อ่านจาก .env (ห้ามเขียนตรง)
 * - i18n: ระบบภาษา ไทย/อังกฤษ
 * - nitro: ตั้งค่า server (ใช้ node-server สำหรับ Docker)
 */
// ⚠️ Domain ยังไม่ได้จดทะเบียน — siteUrl ใช้ค่าจาก env เท่านั้น
//   - dev:  http://localhost:3000
//   - prod: ตั้งใน .env บน server (เช่น http://178.128.127.161 หรือโดเมนจริงเมื่อพร้อม)
const publicSiteUrl = process.env.NUXT_PUBLIC_SITE_URL || ''
// ── ตั้งค่า Cookie ปลอดภัย ──
// production + HTTPS → secure cookie อัตโนมัติ
// ถ้ายังไม่มี SSL ให้ set NUXT_SESSION_COOKIE_SECURE=false ใน .env
const sessionCookieSecureOverride = process.env.NUXT_SESSION_COOKIE_SECURE?.toLowerCase()
const sessionCookieSecure =
  sessionCookieSecureOverride === 'true'
    ? true
    : sessionCookieSecureOverride === 'false'
      ? false
      : process.env.NODE_ENV === 'production' && publicSiteUrl.startsWith('https://')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'nuxt-auth-utils',
    '@vueuse/motion/nuxt',
  ],

  // ── CSS ──
  css: ['~/assets/css/main.css', '~/assets/css/admin.css', '~/assets/css/admin-layout.css'],

  // ── ระบบภาษา (i18n) ──
  // ภาษาไทยเป็น default → URL ไม่มี prefix เช่น /download
  // ภาษาอังกฤษ → /en/download
  // ไฟล์แปลอยู่ที่ i18n/locales/th.json, en.json
  i18n: {
    locales: [
      { code: 'th', name: 'ไทย', file: 'th.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'th',
    langDir: '../i18n/locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang',
      redirectOn: 'root',
    },
  },

  // ── ค่า Runtime (อ่านจาก .env) ──
  // ⚠️ ห้าม hardcode ค่า secret ใดๆ ในไฟล์นี้
  // ค่าใน public → เปิดเผยได้ (ส่งไป client)
  // ค่าที่ไม่อยู่ใน public → server-only (ลับ)
  runtimeConfig: {
    // รหัสเข้ารหัส session cookie (ต้อง 32+ ตัวอักษร)
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      cookie: {
        sameSite: 'lax',
        secure: sessionCookieSecure,
      },
    },
    databaseUrl: process.env.DATABASE_URL || '',         // PostgreSQL connection string
    redisUrl: process.env.REDIS_URL || '',               // Redis สำหรับ cache + rate limit
    recaptchaSecretKey: process.env.NUXT_RECAPTCHA_SECRET_KEY || '',
    adminSeedEmail: process.env.ADMIN_SEED_EMAIL || '',  // admin คนแรกที่สร้างอัตโนมัติ
    adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || '',
    public: {
      siteUrl: publicSiteUrl,
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Eternal Tower Saga',
      gtmId: process.env.NUXT_PUBLIC_GTM_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    },
  },


  // ── App Meta ──
  app: {
    head: {
      htmlAttrs: { lang: 'th' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Eternal Tower Saga — เกม RPG บนมือถือ',
      meta: [
        { name: 'description', content: 'Eternal Tower Saga — เกม Mobile MMORPG แนว K-Fantasy สุดมหากาพย์ ผจญภัยร่วมกัน ปีนหอคอยให้สูงขึ้น' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Eternal Tower Saga' },
        { property: 'og:image', content: '/images/og-cover.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Cinzel (serif display, K-fantasy aesthetic) + Inter (body) + JetBrains Mono (mono tech labels) + Noto Sans Thai (Thai body fallback)
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap' },
      ],
    },
  },

  // ── Nitro Server ──
  // ใช้ node-server preset สำหรับรันใน Docker container
  // ถ้าต้องการ deploy แบบ serverless ให้เปลี่ยนเป็น 'vercel' หรือ 'cloudflare'
  nitro: {
    preset: 'node-server',
  },

  // ── TypeScript ──
  // typeCheck: true runs vue-tsc inline on every nuxt build/dev, catching
  // type regressions before deploy. Safe to enable now — codebase is clean
  // (cleared 18 pre-existing errors in commit 29cf22f).
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
