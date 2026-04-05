import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pre-Register',
  description: 'à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸² Eternal Tower Saga â€” à¸£à¸±à¸šà¸£à¸²à¸‡à¸§à¸±à¸¥à¸ªà¸°à¸ªà¸¡ Milestone à¸ªà¸¸à¸”à¸žà¸´à¹€à¸¨à¸©! Pre-register and get exclusive milestone rewards.',
  openGraph: {
    title: 'Pre-Register â€” Eternal Tower Saga',
    description: 'à¸¥à¸‡à¸—à¸°à¹€à¸šà¸µà¸¢à¸™à¸¥à¹ˆà¸§à¸‡à¸«à¸™à¹‰à¸² à¸£à¸±à¸šà¸£à¸²à¸‡à¸§à¸±à¸¥à¸ªà¸°à¸ªà¸¡ Milestone à¸ªà¸¸à¸”à¸žà¸´à¹€à¸¨à¸©!',
  },
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children
}
