import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'News & Updates',
  description: 'à¸•à¸´à¸”à¸•à¸²à¸¡à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£ à¸à¸´à¸ˆà¸à¸£à¸£à¸¡ à¹à¸¥à¸°à¸­à¸±à¸žà¹€à¸”à¸•à¸¥à¹ˆà¸²à¸ªà¸¸à¸”à¸ˆà¸²à¸ Eternal Tower Saga â€” Stay updated with the latest news and events.',
  openGraph: {
    title: 'News & Updates â€” Eternal Tower Saga',
    description: 'à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£à¹à¸¥à¸°à¸­à¸±à¸žà¹€à¸”à¸•à¸¥à¹ˆà¸²à¸ªà¸¸à¸”à¸ˆà¸²à¸ Eternal Tower Saga',
  },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
