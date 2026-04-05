const fs = require('fs');
const path = require('path');

const files = [
  'download/page.tsx',
  'event/page.tsx',
  'faq/page.tsx',
  'gallery/page.tsx',
  'game-guide/page.tsx',
  'news/page.tsx',
  'story/page.tsx',
  'support/page.tsx',
  'weapons/page.tsx',
];

for (const file of files) {
  const fullPath = path.join(__dirname, 'src/app/(site)', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/const { settings, socialLinks, footer } = useSiteSettings\(\);/g, 'const { settings } = useSiteSettings();');
    content = content.replace(/const { settings, socialLinks, footer, navigationLinks, registrationUrl } = useSiteSettings\(\);/g, 'const { settings } = useSiteSettings();');
    content = content.replace(/const { settings, socialLinks, footer, navigationLinks, registrationUrl, defaultHeroImageUrl } = useSiteSettings\(\);/g, 'const { settings, defaultHeroImageUrl } = useSiteSettings();');
    
    // Fallback regex to just remove the unused ones safely where they exist
    content = content.replace(/socialLinks,\s*/g, '');
    content = content.replace(/footer,\s*/g, '');
    content = content.replace(/navigationLinks,\s*/g, '');
    content = content.replace(/registrationUrl,\s*/g, '');

    fs.writeFileSync(fullPath, content);
  }
}
console.log('Fixed subpages');
