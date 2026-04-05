import type { Metadata } from 'next'

import { resolveGlobalSEO } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return resolveGlobalSEO('faq-page', 'FAQ | Eternal Tower Saga')
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
