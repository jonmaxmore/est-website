import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'à¹à¸à¸¥à¹€à¸¥à¸­à¸£à¸µà¹ˆà¸ à¸²à¸žà¹à¸¥à¸°à¸§à¸­à¸¥à¹€à¸›à¹€à¸›à¸­à¸£à¹Œà¸ˆà¸²à¸à¹‚à¸¥à¸à¸‚à¸­à¸‡ ArcatÃ©a â€” Screenshots, wallpapers, and concept art from Eternal Tower Saga.',
  openGraph: {
    title: 'Gallery â€” Eternal Tower Saga',
    description: 'à¸ à¸²à¸žà¹à¸¥à¸°à¸§à¸­à¸¥à¹€à¸›à¹€à¸›à¸­à¸£à¹Œà¸ˆà¸²à¸à¹‚à¸¥à¸à¸‚à¸­à¸‡ ArcatÃ©a',
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
