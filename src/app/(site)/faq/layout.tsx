import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'à¸„à¸³à¸–à¸²à¸¡à¸—à¸µà¹ˆà¸žà¸šà¸šà¹ˆà¸­à¸¢à¹€à¸à¸µà¹ˆà¸¢à¸§à¸à¸±à¸š Eternal Tower Saga â€” Frequently Asked Questions about the game.',
  openGraph: {
    title: 'FAQ â€” Eternal Tower Saga',
    description: 'à¸„à¸³à¸–à¸²à¸¡à¸—à¸µà¹ˆà¸žà¸šà¸šà¹ˆà¸­à¸¢à¹€à¸à¸µà¹ˆà¸¢à¸§à¸à¸±à¸š Eternal Tower Saga',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
