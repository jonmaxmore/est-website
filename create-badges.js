const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dst = path.join(__dirname, 'public/images');
const srcDir = 'C:/Users/USER/Downloads';

async function convert(srcFile, outName) {
  const svgBuf = fs.readFileSync(path.join(srcDir, srcFile));
  const info = await sharp(svgBuf).webp({ quality: 95 }).toFile(path.join(dst, outName));
  console.log(`${outName}: ${info.width}x${info.height} — ${info.size} bytes`);
}

async function main() {
  await convert('aos-pre-btn.svg', 'badge-google-play.webp');
  await convert('ios-pre-btn.svg', 'badge-app-store.webp');
  console.log('Done!');
}

main().catch(e => console.error('Error:', e));
