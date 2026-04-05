const fs = require('fs');
const path = require('path');

const globalsDir = path.join(__dirname, 'src', 'globals');
const files = fs.readdirSync(globalsDir).filter(f => f.endsWith('.ts') && f !== 'SiteSettings.ts' && f !== 'EventConfig.ts' && f !== 'Maintenance.ts');

for (const file of files) {
  const filePath = path.join(globalsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('SEOGroup')) continue;

  // Inject import
  const importStatement = "import { SEOGroup } from '../fields/SEOGroup'\n";
  const lines = content.split('\n');
  const lastImportIndex = lines.findLastIndex(l => l.startsWith('import '));
  lines.splice(lastImportIndex + 1, 0, importStatement);

  content = lines.join('\n');

  // Inject SEOGroup
  content = content.replace('fields: [', 'fields: [\n    SEOGroup,');

  fs.writeFileSync(filePath, content);
  console.log('Injected SEO into', file);
}
