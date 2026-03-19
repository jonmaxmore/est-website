import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery | Eternal Tower Saga',
  description: 'แกลเลอรี่ภาพและวอลเปเปอร์จากโลกของ Arcatéa — Screenshots, wallpapers, and concept art from Eternal Tower Saga.',
  openGraph: {
    title: 'Gallery — Eternal Tower Saga',
    description: 'ภาพและวอลเปเปอร์จากโลกของ Arcatéa',
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
