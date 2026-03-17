import type { Metadata } from 'next';
import { Outfit, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { LangProvider } from '@/lib/lang-context';
import { SoundProvider } from '@/components/ui/SoundManager';
import { BackToTop, CookieConsent } from '@/components/ui-overlays';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-thai',
  subsets: ['thai'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Eternal Tower Saga — Casual MMORPG | Pre-Register Now',
  description:
    'Eternal Tower Saga: เกมมือถือแนว Casual MMORPG ผสม Action RPG ผจญภัยกับสหายร่วมรบ พิชิตหอคอยนิรันดร์ The Boundless Spire. ลงทะเบียนล่วงหน้าวันนี้!',
  keywords: ['Eternal Tower Saga', 'MMORPG', 'mobile game', 'pre-register', 'mercenary companion', 'เกมมือถือ'],
  openGraph: {
    title: 'Eternal Tower Saga — Rise Together, Conquer the Tower',
    description: 'Casual MMORPG with Mercenary Companion system. Pre-register now for exclusive rewards!',
    type: 'website',
    locale: 'th_TH',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${outfit.variable} ${notoSansThai.variable} antialiased`}>
        <LangProvider>
          <SoundProvider>
            {children}
            <BackToTop />
            <CookieConsent />
          </SoundProvider>
        </LangProvider>
      </body>
    </html>
  );
}
