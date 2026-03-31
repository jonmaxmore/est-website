import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'คำถามที่พบบ่อยเกี่ยวกับ Eternal Tower Saga — Frequently Asked Questions about the game.',
  openGraph: {
    title: 'FAQ — Eternal Tower Saga',
    description: 'คำถามที่พบบ่อยเกี่ยวกับ Eternal Tower Saga',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
