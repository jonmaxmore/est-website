import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Characters | Eternal Tower Saga',
  description: 'พบกับตัวละคร 4 คลาสอาวุธ — ดาบ ธนู ไม้เท้า และออร์บ เลือกอาวุธ เปลี่ยนเกม! Meet the 4 weapon classes in Eternal Tower Saga.',
  openGraph: {
    title: 'Characters — Eternal Tower Saga',
    description: 'เลือกอาวุธ เปลี่ยนเกม! Choose your weapon, shift the battlefield.',
  },
}

export default function CharacterLayout({ children }: { children: React.ReactNode }) {
  return children
}
