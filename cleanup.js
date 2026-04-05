const fs = require('fs');
const path = require('path');
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}
let count = 0;
walkDir('src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf8');
    if (content.includes('ScrollProgress')) {
      content = content.replace(/import\s+ScrollProgress\s+from\s+['"].*?ScrollProgress['"];?\r?\n/g, '');
      content = content.replace(/[ \t]*<ScrollProgress\s*\/?>\r?\n/g, '');
      fs.writeFileSync(filepath, content);
      count++;
      console.log('Cleaned: ' + filepath);
    }
  }
});
console.log('Total files cleaned: ' + count);
