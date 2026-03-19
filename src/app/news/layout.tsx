import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'News & Updates | Eternal Tower Saga',
  description: 'ติดตามข่าวสาร กิจกรรม และอัพเดตล่าสุดจาก Eternal Tower Saga — Stay updated with the latest news and events.',
  openGraph: {
    title: 'News & Updates — Eternal Tower Saga',
    description: 'ข่าวสารและอัพเดตล่าสุดจาก Eternal Tower Saga',
  },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
