const fs = require('fs');
const path = require('path');

const exclude = ['page.tsx']; // keep the homepage untouched because it does NOT have <Navigation> inside it anyway
const siteDir = path.join(__dirname, 'src', 'app', '(site)');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

const pages = walk(siteDir).filter(f => f.endsWith('page.tsx'));

pages.forEach(p => {
  const relative = path.relative(siteDir, p);
  if (exclude.includes(relative)) return; // Skip homepage

  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  // Remove import
  content = content.replace(/import\s+Navigation\s+from\s+['"]@\/components\/site\/Navigation['"];?\n?/, '');

  // Remove <Navigation /> or <Navigation ... /> 
  content = content.replace(/<Navigation[\s\S]*?\/>\n?/g, '');

  if (content !== original) {
    fs.writeFileSync(p, content);
    console.log('Removed Navigation from:', relative);
  }
});
