import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Download',
  description: 'à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸” Eternal Tower Saga à¸šà¸™ iOS, Android à¹à¸¥à¸° PC â€” Download the game on your preferred platform.',
  openGraph: {
    title: 'Download â€” Eternal Tower Saga',
    description: 'à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”à¹€à¸à¸¡ Eternal Tower Saga à¹„à¸”à¹‰à¹à¸¥à¹‰à¸§à¸§à¸±à¸™à¸™à¸µà¹‰!',
  },
}

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children
}
