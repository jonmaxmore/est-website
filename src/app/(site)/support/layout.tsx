import { Metadata } from 'next';
import { resolveGlobalSEO } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return resolveGlobalSEO('support-page', 'Support | Eternal Tower Saga');
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
