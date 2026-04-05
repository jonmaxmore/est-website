import { Metadata } from 'next';
import { resolveGlobalSEO } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return resolveGlobalSEO('game-guide-page', 'Game Guide | Eternal Tower Saga');
}

export default function GameGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
