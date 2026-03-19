import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pre-Register | Eternal Tower Saga',
  description: 'ลงทะเบียนล่วงหน้า Eternal Tower Saga — รับรางวัลสะสม Milestone สุดพิเศษ! Pre-register and get exclusive milestone rewards.',
  openGraph: {
    title: 'Pre-Register — Eternal Tower Saga',
    description: 'ลงทะเบียนล่วงหน้า รับรางวัลสะสม Milestone สุดพิเศษ!',
  },
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children
}
