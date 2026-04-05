import { Metadata } from 'next';
import { resolveGlobalSEO } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return resolveGlobalSEO('story-page', 'Story | Eternal Tower Saga');
}

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
