const fs = require('fs');
const path = require('path');

const layoutsToUpdate = [
  { p: 'download/layout.tsx', slug: 'download-page', fallback: 'Download' },
  { p: 'event/layout.tsx', slug: 'event-config', fallback: 'Event' },
  { p: 'gallery/layout.tsx', slug: 'gallery-page', fallback: 'Gallery' },
  { p: 'news/layout.tsx', slug: 'news-page', fallback: 'News' },
  { p: 'privacy/page.tsx', slug: 'site-settings', fallback: 'Privacy Policy' },
  { p: 'terms/page.tsx', slug: 'site-settings', fallback: 'Terms of Service' },
  { p: 'story/page.tsx', slug: 'story-page', fallback: 'World & Story' },
  { p: 'support/page.tsx', slug: 'support-page', fallback: 'Support' },
  { p: 'game-guide/page.tsx', slug: 'game-guide-page', fallback: 'Game Guide' },
];

const basePath = path.join(__dirname, 'src', 'app', '(site)');

for (const { p, slug, fallback } of layoutsToUpdate) {
  const target = path.join(basePath, p);
  if (!fs.existsSync(target)) continue;

  let content = fs.readFileSync(target, 'utf8');

  // Replace static metadata block
  const startRegex = /export (const metadata: Metadata =|const metadata: Metadata =)/;
  const match = content.match(startRegex);
  if (match) {
    let replaced = false;
    let newContent = content.replace(/export (const metadata: Metadata =|const metadata: Metadata =)[^}]*\n}(\n|$)/, (m) => {
      replaced = true;
      return `import { resolveGlobalSEO } from '@/lib/seo'\n\nexport async function generateMetadata(): Promise<Metadata> {\n  return resolveGlobalSEO('${slug}', '${fallback} | Eternal Tower Saga')\n}\n\n`;
    });
    
    fs.writeFileSync(target, newContent);
    console.log(`Replaced SEO in ${p}`);
  }
}
