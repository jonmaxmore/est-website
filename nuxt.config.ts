// https://nuxt.com/docs/api/configuration/nuxt-config
const publicSiteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://eternaltowersaga.com'
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
  css: ['~/assets/css/main.css'],

  // ── i18n ──
  i18n: {
    locales: [
      { code: 'th', name: 'ไทย', file: 'th.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'th',
    lazy: true,
    langDir: '../i18n/locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang',
      redirectOn: 'root',
    },
  },

  // ── Auth Session ──
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      cookie: {
        sameSite: 'lax',
        secure: sessionCookieSecure,
      },
    },
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL || '',
    recaptchaSecretKey: process.env.NUXT_RECAPTCHA_SECRET_KEY || '',
    adminSeedEmail: process.env.ADMIN_SEED_EMAIL || '',
    adminSeedPassword: process.env.ADMIN_SEED_PASSWORD || '',
    public: {
      siteUrl: publicSiteUrl,
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Eternal Tower Saga',
      gtmId: process.env.NUXT_PUBLIC_GTM_ID || '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    },
  },

  // ── GSAP (client-only) ──
  build: {
    transpile: ['gsap'],
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
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&display=swap' },
      ],
    },
  },

  // ── Nitro Server ──
  nitro: {
    preset: 'node-server',
  },

  // ── TypeScript ──
  typescript: {
    strict: true,
    typeCheck: false, // Enable in Sprint 4 when all types are solid
  },
})
