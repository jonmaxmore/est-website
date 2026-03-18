import type { Metadata } from "next";
import { Outfit, Noto_Sans_Thai } from "next/font/google";
import { LangProvider } from "@/lib/lang-context";
import { BackToTop, CookieConsent } from "@/components/ui-overlays";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://178.128.127.161';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Eternal Tower Saga | เกมมือถือ RPG",
    template: "%s | Eternal Tower Saga",
  },
  description: "ผจญภัยไปด้วยกัน พิชิตยอดหอคอย — Rise Together, Conquer the Tower. ลงทะเบียนล่วงหน้าเกมมือถือ RPG สุดมัน!",
  keywords: [
    "Eternal Tower Saga", "ETS", "mobile RPG", "pre-register",
    "เกมมือถือ", "เกม RPG", "ลงทะเบียนล่วงหน้า", "เกมแอคชั่น",
    "tower defense", "MMORPG", "เกมออนไลน์", "pre-registration",
    "mercenary companion", "action RPG", "game Thailand",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://178.128.127.161'),
  openGraph: {
    title: "Eternal Tower Saga — Rise Together. Conquer the Tower.",
    description: "ลงทะเบียนล่วงหน้าเกมมือถือ RPG สุดมัน! ผจญภัยไปด้วยกัน พิชิตยอดหอคอย",
    type: "website",
    locale: "th_TH",
    alternateLocale: "en_US",
    siteName: "Eternal Tower Saga",
    images: [{
      url: '/images/hero-bg.webp',
      width: 1200,
      height: 630,
      alt: 'Eternal Tower Saga — Rise Together, Conquer the Tower',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eternal Tower Saga',
    description: 'Rise Together. Conquer the Tower. Pre-register now!',
    images: ['/images/hero-bg.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/logo.webp',
  },
  other: {
    'theme-color': '#040E21',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${outfit.variable} ${notoSansThai.variable}`}>
      <head>
        <meta name="theme-color" content="#040E21" />
        {/* GEO: JSON-LD Structured Data — VideoGame + Organization + FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "VideoGame",
                  "@id": "https://eternaltowersaga.com/#game",
                  "name": "Eternal Tower Saga",
                  "alternateName": ["ETS", "เกม Eternal Tower Saga"],
                  "description": "Rise Together. Conquer the Tower. เกมมือถือ RPG แนว Casual MMORPG ผจญภัยพร้อมสหายร่วมรบ (Mercenary Companion) สำรวจโลก Arcatéa พิชิตหอคอยนิรันดร์ The Boundless Spire ตั้งกิลด์ต่อสู้ PvP แบบเรียลไทม์",
                  "genre": ["RPG", "Action RPG", "MMORPG", "Casual", "Adventure"],
                  "gamePlatform": ["iOS", "Android", "PC"],
                  "applicationCategory": "GameApplication",
                  "operatingSystem": ["iOS 14+", "Android 8+", "Windows 10+"],
                  "inLanguage": ["th", "en"],
                  "url": SITE_URL,
                  "image": `${SITE_URL}/images/og-cover.webp`,
                  "screenshot": `${SITE_URL}/images/hero-bg.webp`,
                  "datePublished": "2026-04-02",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "THB",
                    "availability": "https://schema.org/PreOrder",
                    "url": `${SITE_URL}/event`
                  },
                  "publisher": { "@id": "https://eternaltowersaga.com/#publisher" },
                  "author": { "@id": "https://eternaltowersaga.com/#publisher" }
                },
                {
                  "@type": "Organization",
                  "@id": "https://eternaltowersaga.com/#publisher",
                  "name": "อัลติเมตเกม จำกัด",
                  "alternateName": "Ultimate Game Co., Ltd.",
                  "url": SITE_URL,
                  "logo": `${SITE_URL}/images/logo.webp`,
                  "sameAs": [
                    "https://facebook.com/EternalTowerSaga",
                    "https://tiktok.com/@EternalTowerSaga",
                    "https://youtube.com/@EternalTowerSaga",
                    "https://discord.gg/eternaltowersaga"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://eternaltowersaga.com/#website",
                  "name": "Eternal Tower Saga",
                  "url": SITE_URL,
                  "publisher": { "@id": "https://eternaltowersaga.com/#publisher" },
                  "inLanguage": ["th", "en"]
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://eternaltowersaga.com/#faq",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "Eternal Tower Saga เป็นเกมแนวอะไร?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Eternal Tower Saga เป็นเกมมือถือแนว Casual MMORPG ผสม Action RPG ที่เน้นระบบ Mercenary Companion (สหายร่วมรบ) ผจญภัยในโลก Arcatéa ปีนหอคอยนิรันดร์ The Boundless Spire ต่อสู้ PvP แบบเรียลไทม์ และสร้างกิลด์กับเพื่อน"
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "เกมนี้รองรับมือถือสเปคไหนบ้าง?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Eternal Tower Saga รองรับ iOS 14 ขึ้นไป, Android 8.0 ขึ้นไป และ PC (Windows 10 ขึ้นไป) สามารถดาวน์โหลดได้ฟรีจาก App Store, Google Play และเว็บไซต์ทางการ"
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "ระบบ Mercenary Companion คืออะไร?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "ระบบ Mercenary Companion เป็นจุดเด่นเฉพาะของ Eternal Tower Saga ที่ผู้เล่นสามารถต่อสู้เคียงข้างสหายร่วมรบผู้ทรงพลัง 4 คลาส ได้แก่ นักดาบ (Swordsman), นักธนู (Archer), จอมเวท (Mage) และนักบวช (Priest) — ไม่ใช่แค่สัตว์เลี้ยง แต่เป็นสหายที่มี AI ร่วมรบจริงๆ"
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "มีระบบกิลด์หรือเล่นกับเพื่อนได้ไหม?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "มีครับ! Eternal Tower Saga รองรับระบบกิลด์เต็มรูปแบบ สร้างกิลด์ ชวนเพื่อนมาร่วมทีม ร่วมมือกันพิชิตบอสดันเจี้ยนสุดโหด และแข่ง PvP Arena แบบเรียลไทม์กับผู้เล่นคนอื่น"
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "ลงทะเบียนล่วงหน้า (Pre-Register) จะได้รับอะไรบ้าง?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "ผู้ที่ลงทะเบียนล่วงหน้าจะได้รับรางวัลสะสมตาม Milestone ได้แก่ ทอง ×200,000 + ม้วนฟื้นพลัง ×10, หินอาวุธ ×100 + หินเกราะ ×100, มานา ×12,000, ตั๋วเสื้อผ้า ×10, ตั๋วอัญเชิญ ×10 และบ้านแห่งโชค ×1 เมื่อยอดลงทะเบียนถึงเป้า"
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Eternal Tower Saga ผลิตโดยบริษัทอะไร?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Eternal Tower Saga พัฒนาและจัดจำหน่ายโดย บริษัท อัลติเมตเกม จำกัด (Ultimate Game Co., Ltd.) สตูดิโอเกมจากประเทศไทย"
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />
        {/* GA4 */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} />
            <script dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA4_ID}');`
            }} />
          </>
        )}
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <script dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');fbq('track','PageView');`
            }} />
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img height="1" width="1" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
            </noscript>
          </>
        )}
      </head>
      <body className="antialiased">
        <LangProvider>
          {children}
          <BackToTop />
          <CookieConsent />
        </LangProvider>
      </body>
    </html>
  );
}
